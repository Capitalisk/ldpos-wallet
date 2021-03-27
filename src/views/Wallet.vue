<template>
  <Navbar />
  <DataTable
    title="Wallet transactions"
    :columns="columns"
    clickable
    :fn="fn"
  />
</template>

<script>
import { inject, onMounted, ref } from 'vue';

import Navbar from '../components/sections/Navbar';
import DataTable from '../components/parts/DataTable';

import { _parseDate, _transformMonetaryUnit } from '../utils';
import router from '../router';

import { DETAIL_MODAL } from '../components/modals/constants';

export default {
  name: 'Wallet',
  setup() {
    const store = inject('store');

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
        ...inboundTransactions.map((t) => ({ ...t, direction: 'INBOUND' })),
        ...outboundTransactions.map((t) => ({ ...t, direction: 'OUTBOUND' })),
      ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

      return Promise.resolve(transactions);
    };

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
        shrinkable: false,
      },
      {
        name: 'senderAddress',
        label: 'Sender',
        field: 'senderAddress',
        sortable: false,
        value: (val) => val,
        active: true,
        class: 'address',
      },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        field: 'recipientAddress',
        sortable: false,
        value: (val) => val,
        active: true,
        class: 'address',
      },
      {
        name: 'timestamp',
        label: 'Date',
        field: 'timestamp',
        sortable: false,
        value: (val) => _parseDate(val),
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
      // {
      //   name: 'message',
      //   label: 'Message',
      //   field: 'message',
      //   sortable: false,
      //   value: (val) => val,
      //   active: true,
      // },
    ]);

    return {
      columns,
      fn: getWallet,
    };
  },
  components: { Navbar, DataTable },
};
</script>

<style scoped>
.wallet {
  width: 100%;
}
</style>
