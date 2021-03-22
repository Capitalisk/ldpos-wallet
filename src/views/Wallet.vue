<template>
  <Navbar />
  <DataTable
    title="Wallet transactions"
    :rows="transactions"
    :columns="columns"
  />
</template>

<script>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import AccountDetails from '../components/sections/AccountDetails';
import Navbar from '../components/sections/Navbar';
import DataTable from '../components/parts/DataTable';

import { _parseDate, _transformMonetaryUnit } from '../utils';
import router from '../router';

export default {
  name: 'Wallet',
  setup() {
    const store = useStore();

    const transactions = ref([]);

    onMounted(async () => {
      if (!store.state.authenticated) {
        router.push('/');
        return;
      }

      const inboundTransactions = await store.state.client.getInboundTransactions(
        store.state.client.getWalletAddress(),
        null,
        50,
        'asc',
      );
      const outboundTransactions = await store.state.client.getOutboundTransactions(
        store.state.client.getWalletAddress(),
        null,
        50,
        'asc',
      );

      transactions.value = [
        ...inboundTransactions.map((t) => ({ ...t, direction: 'INBOUND' })),
        ...outboundTransactions.map((t) => ({ ...t, direction: 'OUTBOUND' })),
      ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
    });

    const columns = ref([
      {
        name: 'direction',
        label: 'Direction',
        field: 'direction',
        sortable: false,
        value: (val) => (val === 'INBOUND' ? 'incoming' : 'outgoing'),
        active: true,
      },
      {
        name: 'type',
        label: 'Type',
        field: 'type',
        sortable: false,
        active: true,
        noWrap: true,
      },
      {
        name: 'recipientAddress',
        label: 'Recipient address',
        field: 'recipientAddress',
        sortable: false,
        value: (val) => val,
        active: true,
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
      },
      {
        name: 'timestamp',
        label: 'timestamp',
        field: 'timestamp',
        sortable: false,
        value: (val) => _parseDate(val),
        active: true,
      },
      {
        name: 'message',
        label: 'message',
        field: 'message',
        sortable: false,
        value: (val) => val,
        active: true,
      },
      {
        name: 'senderAddress',
        label: 'senderAddress',
        field: 'senderAddress',
        sortable: false,
        value: (val) => val,
        active: true,
      },
    ]);

    return {
      transactions,
      columns,
    };
  },
  components: { AccountDetails, Navbar, DataTable },
};
</script>

<style scoped>
.wallet {
  width: 100%;
}
</style>
