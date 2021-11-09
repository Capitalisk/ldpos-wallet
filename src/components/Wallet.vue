<template>
  <ConfirmationModal ref="confirmationRef">
    <div class="mb-1">
      Forging passphrase
    </div>
    <Input
      v-model="passphrase"
      :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
    />
  </ConfirmationModal>
  <div class="flex flex-wrap flex-gap mb-2">
    <Section
      :loading="address.loading"
      :error="address.error"
      v-if="authenticated"
      class="flex-12"
    >
      <div class="flex flex-wrap-mobile">
        <div class="flex-6 flex-sm-12 mr-auto">
          <strong>Balance:</strong>
          {{ transformMonetaryUnit(balance.data, networkSymbol) }}
          <Button
            :value="`Send ${networkSymbol}`"
            class="mt-4"
            style="width: 110px"
            @click="openTransferModal"
          />
        </div>
        <div class="flex-6 flex-sm-12 wallet-address">
          <h2>Wallet Address</h2>
          <br />
          <Copy class="mb-auto" :value="address.data" :shrink="shrink" />
          <Button
            value="Register as a delegate"
            class="mt-4 outline wallet-address"
            style="width: 250px"
            @click="confirmationModal({ message: '' })"
          />
        </div>
      </div>
    </Section>
  </div>
  <DataTable
    title="Wallet transactions"
    :columns="columns"
    clickable
    :fn="fn"
    :arg="walletAddress"
  >
    <template v-slot:direction="slotProps">
      <i
        v-if="slotProps.row.direction === 'inbound'"
        class="fas fa-chevron-down text-success"
      />
      <i
        v-else-if="slotProps.row.direction === 'outbound'"
        class="fas fa-chevron-up text-danger"
      />
      <span v-else>
        <i class="far fa-circle mr-1 text-warning" />
        Pending...
      </span>
    </template>
    <template v-slot:senderAddress="slotProps">
      <Copy :value="slotProps.row.senderAddress" :shrink="slotProps.shrink" />
    </template>
    <template v-slot:recipientAddress="slotProps">
      <Copy
        :value="slotProps.row.recipientAddress"
        :shrink="slotProps.shrink"
      />
    </template>
  </DataTable>
</template>

<script>
import { computed, inject, onMounted, ref, reactive, onUnmounted } from 'vue';

import Navbar from './Navbar';
import DataTable from './DataTable';
import Copy from './Copy';
import Section from './Section';
import Button from './Button';

import { _capitalize, _parseDate, _transformMonetaryUnit } from '../utils';
import router from '../router';

import { DETAIL_MODAL, TRANSFER_MODAL } from './modals/constants';
import ConfirmationModal from './modals/ConfirmationModal';
import Input from './Input';

export default {
  name: 'Wallet',
  setup() {
    const store = inject('store');

    const interval = ref(null);

    const address = reactive({ loading: true, data: null, error: null });
    const balance = reactive({ loading: true, data: null, error: null });

    const getWallet = async (
      arg = store.client.value.getWalletAddress(),
      fromTimestamp = null,
      offset = 0,
      limit = 10,
      order = 'desc',
      page = 1,
    ) => {
      if (!store.state.authenticated) {
        router.push({ name: 'wallet' });
        return;
      }
      try {
        const pendingTransactions = await store.client.value.getOutboundPendingTransactions(
          arg,
          offset,
          limit,
        );

        let l;
        if (page === 1)
          l = pendingTransactions.length
            ? limit - pendingTransactions.length
            : limit;
        else l = limit;

        const transactions = [
          ...pendingTransactions.map(t => ({ ...t, direction: 'pending' })),
          ...(
            await store.client.value.getAccountTransactions(
              arg,
              fromTimestamp,
              offset,
              l,
              order,
            )
          ).map(t => ({
            ...t,
            direction: t.recipientAddress === arg ? 'inbound' : 'outbound',
          })),
        ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

        return Promise.resolve(transactions);
      } catch (e) {
        console.error(e);
      }
    };

    const getBalance = async () => {
      balance.loading = true;
      try {
        const { balance: b } = await store.client.value.getAccount(
          address.data,
        );
        balance.data = b;
      } catch (err) {
        if (err.sourceError.name === 'AccountDidNotExistError') {
          if (
            store.client.value.validatePassphrase(store.client.value.passphrase)
          ) {
            balance.data = '0';
            balance.loading = false;
          }
        } else {
          balance.error = err.message;
        }
      }
      balance.loading = false;
    };

    onUnmounted(() => {
      clearInterval(interval);
      address.loading = true;
      balance.loading = true;
    });

    onMounted(async () => {
      store.mutateProgressbarLoading(true);
      try {
        address.data = await store.client.value.getWalletAddress();
      } catch (e) {
        address.error = e;
      }
      address.loading = false;

      await getBalance();
      interval.value = setInterval(async () => {
        await getBalance();
      }, 5000);
      store.mutateProgressbarLoading(false);
    });

    const columns = ref([
      // {
      //   name: 'type',
      //   label: 'Type',
      //   field: 'type',
      //   sortable: false,
      //   active: true,
      //   shrinkable: false,
      // },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        field: 'recipientAddress',
        sortable: false,
        value: val => val,
        active: true,
        slot: true,
      },
      {
        name: 'timestamp',
        label: 'Date',
        field: 'timestamp',
        sortable: false,
        value: val => _parseDate(val),
        active: true,
      },
      {
        name: 'amount',
        label: 'Amount',
        field: 'amount',
        sortable: false,
        value: val =>
          _transformMonetaryUnit(val, store.state.config.networkSymbol),
        active: true,
      },
      {
        name: 'fee',
        label: 'Fee',
        field: 'fee',
        sortable: false,
        value: val =>
          _transformMonetaryUnit(val, store.state.config.networkSymbol),
        active: true,
      },
      {
        name: 'direction',
        label: 'Direction',
        sortable: false,
        active: true,
        slot: true,
      },
    ]);

    const confirmationRef = ref(null);
    const passphrase = ref(null);

    const confirmationModal = async () => {
      try {
        const { minTransactionFees } = await store.client.value.getMinFees();

        const response = await confirmationRef.value.show({
          message: `Are you sure you want to register as a delegate? A fee of ${_transformMonetaryUnit(
            minTransactionFees.registerForgingDetails,
          )} will be deducted from your account.`,
          showCancelButton: true,
        });

        if (response) {
          const newNextForgingKeyIndex = 0;
          if (!passphrase.value)
            throw new Error('Passphrase should be present');

          const registerTxn = await store.client.value.prepareRegisterForgingDetails(
            {
              newNextForgingKeyIndex,
              forgingPassphrase: passphrase.value,
              message: 'Register as a delegate via ldpos-wallet',
              fee: minTransactionFees.registerForgingDetails,
            },
          );

          await store.client.value.postTransaction(registerTxn);

          store.notify({ message: 'Succesfully registered as a delegate' }, 5);
        }
      } catch (e) {
        store.notify({
          message: e.message,
          error: true,
        });
      }

      passphrase.value = null;
    };

    return {
      columns,
      fn: getWallet,
      authenticated: computed(() => store.state.authenticated),
      address: computed(() => address),
      balance: computed(() => balance),
      walletAddress: computed(() => store.client.value.getWalletAddress()),
      openTransferModal: () =>
        balance.data > 0
          ? store.toggleOrBrowseModal({ type: TRANSFER_MODAL })
          : store.notify(
              {
                message:
                  "Cross your fingers and hope for a miraculous transaction. Until that, you don't have any balance to transfer.",
                error: true,
              },
              5,
            ),
      details: data =>
        store.toggleOrBrowseModal({
          type: DETAIL_MODAL,
          data,
        }),
      transformMonetaryUnit: _transformMonetaryUnit,
      networkSymbol: store.state.config.networkSymbol,
      confirmationRef,
      confirmationModal,
      passphrase,
      shrink: window.innerWidth < 768,
    };
  },
  components: {
    Navbar,
    DataTable,
    Copy,
    Section,
    Button,
    ConfirmationModal,
    Input,
  },
};
</script>

<style scoped>
.wallet {
  width: 100%;
}

ul {
  list-style: none;
}

.wallet-address {
  padding-top: var(--unit-2);
}

@media screen and (min-width: 768px) {
  .wallet-address {
    padding-top: inherit;
    text-align: right;
    margin-left: auto;
  }
}
</style>
