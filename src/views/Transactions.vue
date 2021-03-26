<template>
  <Navbar />
  <DataTable
    :columns="columns"
    title="All transactions on the chain"
    clickable
    order="desc"
    fn="getTransactionsByTimestamp"
  />
</template>

<script>
import { computed, inject, onMounted, ref } from 'vue';

import Navbar from '../components/sections/Navbar.vue';
import DataTable from '../components/parts/DataTable.vue';
import { _transformMonetaryUnit, _parseDate } from '../utils';

export default {
  name: 'Transactions',
  setup() {
    const store = inject('store');

    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'senderAddress',
        label: 'Sender',
        field: 'senderAddress',
        sortable: false,
        class: 'address',
        active: true,
      },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        field: 'recipientAddress',
        sortable: false,
        class: 'address',
        active: true,
      },
      {
        name: 'timestamp',
        label: 'Date',
        field: 'timestamp',
        sortable: true,
        value: (val) => _parseDate(val),
        active: true,
        sorted: 'desc',
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
    ]);

    return {
      columns,
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
