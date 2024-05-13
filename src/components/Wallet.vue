<template>
  <ConfirmationModal ref="confirmationRef">
    <div class="mb-1">{{passphraseInputLabel}}</div>
    <Input
      v-model="passphrase"
      :rules="[
        (val) => !!val || (val && val.length <= 0) || 'Required',
        (val) => validatePassphrase(val) || 'Must be a 12 word BIP39 mnemonic',
      ]"
    />
  </ConfirmationModal>
  <div class="flex flex-wrap flex-gap mb-2">
    <Section
      :loading="address.loading"
      :error="address.error"
      v-if="authenticated"
      class="flex-12"
    >
      <div class="flex flex-wrap-tablet">
        <div class="flex-12 flex-md-6 mr-auto wallet-basic-container">
          <strong>Balance:</strong>
          {{ transformMonetaryUnit(balance.data, networkSymbol) }}
          <Button
            :value="`Send ${networkSymbol}`"
            class="mt-4"
            style="width: 150px"
            @click="openTransferModal"
          />
          <Button
            :value="`Request ${networkSymbol}`"
            class="mt-4 outline"
            style="width: 150px"
            router-link
            :href="`/transaction/create/?type=request&recipientAddress=${address.data}`"
          />
        </div>
        <div class="flex-12 flex-md-6 wallet-address">
          <h2>Wallet Address</h2>
          <br />
          <Copy class="mb-auto" :value="address.data" :shrink="shrink" />
          <div class="mt-4 register-buttons-container wallet-address">
            <Button
              value="Register as a delegate"
              class="outline"
              style="width: 250px"
              @click="registerDelegateModal({ message: '' })"
            />
            <Button
              value="Register multisig key"
              class="outline"
              style="width: 250px"
              @click="registerMultisigKeyModal({ message: '' })"
            />
          </div>
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
    <template v-slot:id="slotProps">
      <Copy
        :value="slotProps.row.id"
        :shrink="slotProps.shrink"
        :link="`/transactions/${slotProps.row.id}`"
      />
    </template>
    <template v-slot:counterpartyAddress="slotProps">
      <Copy
        :value="slotProps.row.counterpartyAddress"
        :shrink="slotProps.shrink"
        :link="`/accounts/${slotProps.row.counterpartyAddress}`"
      />
    </template>
  </DataTable>
</template>

<script setup>
import { computed, inject, onMounted, ref, reactive, onUnmounted } from 'vue';

import DataTable from './DataTable';
import Copy from './Copy';
import Section from './Section';
import Button from './Button';

import { _capitalize, _parseDate, _transformMonetaryUnit } from '../utils';
import router from '../router';

import { TRANSFER_MODAL } from './modals/constants';
import ConfirmationModal from './modals/ConfirmationModal';
import Input from './Input';

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
    const pendingTransactions =
      await store.client.value.getOutboundPendingTransactions(
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
      ...pendingTransactions.map((t) => ({
        ...t,
        counterpartyAddress:
          t.recipientAddress === arg ? t.senderAddress : t.recipientAddress,
        direction: 'pending',
      })),
      ...(
        await store.client.value.getAccountTransactions(
          arg,
          fromTimestamp,
          offset,
          l,
          order,
        )
      ).map((t) => ({
        ...t,
        counterpartyAddress:
          t.recipientAddress === arg ? t.senderAddress : t.recipientAddress,
        direction: t.recipientAddress === arg ? 'inbound' : 'outbound',
      })),
    ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

    return Promise.resolve(transactions);
  } catch (e) {
    console.error(e);
  }
};

const getBalance = async () => {
  if (!address.data) return;
  balance.loading = true;
  try {
    const { balance: b } = await store.client.value.getAccount(address.data);
    balance.data = b;
  } catch (err) {
    if (err.sourceError && err.sourceError.name === 'AccountDidNotExistError') {
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
  clearInterval(interval.value);
  address.loading = true;
  balance.loading = true;
});

onMounted(async () => {
  store.incrementLoadingCount();
  try {
    address.data = await store.client.value.getWalletAddress();
  } catch (e) {
    address.error = e;
  }
  address.loading = false;

  try {
    await getBalance();
    interval.value = setInterval(async () => {
      await getBalance();
    }, 5000);
  } catch (e) {
    console.error(e);
  }
  store.decrementLoadingCount();
});

const columns = ref([
  {
    name: 'id',
    label: 'Id',
    field: 'id',
    sortable: false,
    active: true,
    slot: true,
    shrinkUntilWidth: 2100,
    hideOnMobile: true,
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    sortable: false,
    active: true,
    hideOnMobile: true,
  },
  {
    name: 'counterpartyAddress',
    label: 'Counterparty',
    field: 'counterpartyAddress',
    sortable: false,
    value: (val) => val,
    active: true,
    slot: true,
    shrinkUntilWidth: 1800,
    hideOnMobile: true,
  },
  {
    name: 'timestamp',
    label: 'Date',
    field: 'timestamp',
    sortable: false,
    value: (val) => _parseDate(val),
    active: true,
    hideOnMobile: true,
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    sortable: false,
    value: (val) =>
      _transformMonetaryUnit(val, store.state.config.networkSymbol),
    active: true,
  },
  {
    name: 'fee',
    label: 'Fee',
    field: 'fee',
    sortable: false,
    value: (val) =>
      _transformMonetaryUnit(val, store.state.config.networkSymbol),
    active: true,
    hideOnMobile: true,
  },
  {
    name: 'direction',
    label: '',
    sortable: false,
    active: true,
    slot: true,
  },
]);

const confirmationRef = ref(null);
const passphrase = ref(null);
const passphraseInputLabel = ref(null);

const registerDelegateModal = async () => {
  passphraseInputLabel.value = 'Forging passphrase';
  try {
    const { minTransactionFees } = await store.client.value.getMinFees();

    const response = await confirmationRef.value.show({
      title: 'Register delegate',
      message: `Are you sure you want to register as a delegate? A fee of ${_transformMonetaryUnit(
        minTransactionFees.registerForgingDetails,
      )} will be deducted from your account.`,
      showCancelButton: true,
    });

    if (response) {
      const newNextForgingKeyIndex = 0;
      if (!passphrase.value) throw new Error('Passphrase should be present');

      if (!store.client.value.validatePassphrase(passphrase.value))
        throw new Error('Passphrase should be a valid 12 word BIP39 mnemonic');

      const registerTxn =
        await store.client.value.prepareRegisterForgingDetails({
          newNextForgingKeyIndex,
          forgingPassphrase: passphrase.value,
          message: 'Register as a delegate via ldpos-wallet',
          fee: minTransactionFees.registerForgingDetails,
        });

      await store.client.value.postTransaction(registerTxn);

      store.notify({ message: 'The registration transaction was posted' }, 5);
    }
  } catch (e) {
    store.notify({
      message: e.message,
      error: true,
    });
  }

  passphrase.value = null;
};

const registerMultisigKeyModal = async () => {
  passphraseInputLabel.value = 'Multisig passphrase';
  try {
    const { minTransactionFees } = await store.client.value.getMinFees();

    const response = await confirmationRef.value.show({
      title: 'Register multisig key',
      message: `Are you sure you want to register a multisig key? A fee of ${_transformMonetaryUnit(
        minTransactionFees.registerMultisigDetails,
      )} will be deducted from your account.`,
      showCancelButton: true,
    });

    if (response) {
      const newNextMultisigKeyIndex = 0;
      if (!passphrase.value) throw new Error('Passphrase should be present');

      if (!store.client.value.validatePassphrase(passphrase.value))
        throw new Error('Passphrase should be a valid 12 word BIP39 mnemonic');

      const registerTxn =
        await store.client.value.prepareRegisterMultisigDetails({
          newNextMultisigKeyIndex,
          multisigPassphrase: passphrase.value,
          message: 'Register multisig details via ldpos-wallet',
          fee: minTransactionFees.registerMultisigDetails,
        });

      await store.client.value.postTransaction(registerTxn);

      store.notify({ message: 'The registration transaction was posted' }, 5);
    }
  } catch (e) {
    store.notify({
      message: e.message,
      error: true,
    });
  }

  passphrase.value = null;
};

const fn = getWallet;
const authenticated = computed(() => store.state.authenticated);
const walletAddress = computed(() => store.client.value.getWalletAddress());

const openTransferModal = () =>
  balance.data > 0
    ? store.toggleOrBrowseModal({ type: TRANSFER_MODAL })
    : store.notify(
        {
          message:
            "Cross your fingers and hope for a miraculous transaction. Until that, you don't have any balance to transfer.",
          error: true,
        },
        5,
      );

const transformMonetaryUnit = _transformMonetaryUnit;
const validatePassphrase = (val) => store.client.value.validatePassphrase(val);
const networkSymbol = store.state.config.networkSymbol;
const shrink = window.innerWidth < 992;
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

@media screen and (min-width: 769px) {
  .wallet-address {
    padding-top: inherit;
    text-align: right;
    margin-left: auto;
  }
}

.register-buttons-container {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: flex-end;
}

@media screen and (max-width: 1199px) {
  .register-buttons-container {
    flex-direction: column;
    gap: 20px;
  }
}

@media screen and (max-width: 991px) {
  .register-buttons-container {
    flex-direction: column;
    gap: 20px;
  }

  .wallet-basic-container {
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 768px) {
  .register-buttons-container {
    align-items: flex-start;
  }
}

</style>
