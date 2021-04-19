<template>
  <div class="flex flex-wrap flex-gap mb-2">
    <Section
      :loading="address.loading"
      title="Wallet address"
      :error="address.error"
      v-if="authenticated"
      class="flex-3"
    >
      <Copy class="mb-auto" :value="address.data" trim />
    </Section>
    <Section
      :loading="balance.loading"
      title="Balance"
      :needsAuthentication="true"
      :error="balance.error"
      v-if="authenticated"
      class="flex-3"
    >
      <h2 class="mb-auto">{{ transformMonetaryUnit(balance.data) }}</h2>
      <Button value="Send" class="mt-4" @click="openTransferModal" />
    </Section>
    <Section
      :loading="pendingTransactions.loading"
      title="Pending transactions"
      :error="pendingTransactions.error"
      v-if="authenticated"
      class="flex-3"
    >
      <ul v-if="pendingTransactions.data.length">
        <template
          v-for="transaction in pendingTransactions.data"
          :key="transaction.id"
        >
          <li
            class="lineheight-3 font-12 cursor-pointer"
            @click="details(transaction)"
          >
            <div class="flex align-center">
              <strong>{{ transformMonetaryUnit(transaction.amount) }}</strong
              >&nbsp;
              {{ transaction.direction === 'INBOUND' ? 'from' : 'to' }}&nbsp;
              <strong>
                <Copy
                  :value="
                    transaction.direction === 'INBOUND'
                      ? transaction.senderAddress
                      : transaction.recipientAddress
                  "
                  trim
                />
              </strong>
              <hr />
            </div>
          </li>
        </template>
      </ul>
      <p v-else>No latest transactions available</p>
    </Section>
  </div>
  <DataTable title="Wallet transactions" :columns="columns" clickable :fn="fn">
    <template v-slot:direction="slotProps">
      <i
        :class="
          `fas fa-${directions[slotProps.row.direction]} mr-1 ${
            slotProps.row.direction === 'INBOUND'
              ? 'text-success'
              : 'text-error'
          }`
        "
      ></i>
    </template>
  </DataTable>
</template>

<script>
import { computed, inject, onMounted, ref, reactive } from 'vue';

import Navbar from './Navbar';
import DataTable from './DataTable';
import Copy from './Copy';
import Section from './Section';
import Button from './Button';

import { _parseDate, _transformMonetaryUnit } from '../utils';
import router from '../router';

import { DETAIL_MODAL, TRANSFER_MODAL } from './modals/constants';

export default {
  name: 'Wallet',
  setup() {
    const store = inject('store');

    const address = reactive({ loading: true, data: null, error: null });
    const balance = reactive({ loading: true, data: null, error: null });
    const pendingTransactions = reactive({
      loading: true,
      data: null,
      error: null,
    });

    const getPendingTransactions = async () => {
      pendingTransactions.loading = true;
      try {
        pendingTransactions.data = await store.client.value.getOutboundPendingTransactions(
          store.client.value.getWalletAddress(),
          null,
          50,
          'asc',
        );
      } catch (err) {
        pendingTransactions.error = err.message;
      }
      pendingTransactions.loading = false;
    };

    const getWallet = async () => {
      if (!store.state.authenticated) {
        router.push('/');
        return;
      }

      const inboundTransactions = await store.client.value.getInboundTransactions(
        store.client.value.getWalletAddress(),
        null,
        50,
        'asc',
      );
      const outboundTransactions = await store.client.value.getOutboundTransactions(
        store.client.value.getWalletAddress(),
        null,
        50,
        'asc',
      );

      const transactions = [
        ...inboundTransactions.map(t => ({ ...t, direction: 'INBOUND' })),
        ...outboundTransactions.map(t => ({ ...t, direction: 'OUTBOUND' })),
      ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

      return Promise.resolve(transactions);
    };

    onMounted(async () => {
      try {
        address.data = await store.client.value.getWalletAddress();
      } catch (e) {
        address.error = e;
      }
      address.loading = false;

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

      await getPendingTransactions();
      setInterval(async () => {
        await getPendingTransactions();
      }, 10000);
    });

    const columns = ref([
      {
        name: 'direction',
        label: 'Direction',
        sortable: false,
        value: val => (val === 'INBOUND' ? 'incoming' : 'outgoing'),
        active: true,
        slot: true,
      },
      {
        name: 'type',
        label: 'Type',
        field: 'type',
        sortable: false,
        active: true,
        shrinkable: false,
      },
      {
        name: 'senderAddress',
        label: 'Sender',
        field: 'senderAddress',
        sortable: false,
        value: val => val,
        active: true,
        class: 'address',
      },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        field: 'recipientAddress',
        sortable: false,
        value: val => val,
        active: true,
        class: 'address',
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
    ]);

    return {
      columns,
      fn: getWallet,
      directions: {
        OUTBOUND: 'chevron-up',
        INBOUND: 'chevron-down',
      },
      authenticated: computed(() => store.state.authenticated),
      address: computed(() => address),
      balance: computed(() => balance),
      pendingTransactions: computed(() => pendingTransactions),
      openTransferModal: () =>
        balance.data > 0
          ? store.toggleModal({ type: TRANSFER_MODAL })
          : store.notify(
              {
                message:
                  "Cross your fingers and hope for a miraculous transaction. Until that, you don't have any balance to transfer.",
                error: true,
              },
              5,
            ),
      details: data =>
        store.toggleModal({
          type: DETAIL_MODAL,
          data,
        }),
      transformMonetaryUnit: _transformMonetaryUnit,
    };
  },
  components: { Navbar, DataTable, Copy, Section, Button },
};
</script>

<style scoped>
.wallet {
  width: 100%;
}

ul {
  list-style: none;
}
</style>
