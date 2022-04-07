<template>
  <Navbar :title="title" />
  <DataTable
    :columns="columns"
    clickable
    order="desc"
    fn="getTransactionsByTimestamp"
    prefix="transactions"
  >
    <template v-slot:senderAddress="slotProps">
      <Copy
        :value="slotProps.row.senderAddress"
        :shrink="slotProps.shrink"
        :link="`/accounts/${slotProps.row.senderAddress}`"
      />
    </template>
    <template v-slot:recipientAddress="slotProps">
      <Copy
        :value="slotProps.row.recipientAddress"
        v-if="slotProps.row.recipientAddress"
        :shrink="slotProps.shrink"
        :link="`/accounts/${slotProps.row.recipientAddress}`"
      />
      <span v-else>-</span>
    </template>
  </DataTable>
</template>

<script>
import { computed, inject, onMounted, ref } from 'vue';

import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';
import { _transformMonetaryUnit, _parseDate } from '../utils';

export default {
  name: 'Transactions',
  props: {
    title: { type: String, required: true },
  },
  setup() {
    const store = inject('store');

    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'senderAddress',
        label: 'Sender',
        field: 'senderAddress',
        sortable: false,
        active: true,
        slot: true,
      },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        field: 'recipientAddress',
        sortable: false,
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
        sorted: 'desc',
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
    };
  },
  components: { DataTable, Navbar, Copy },
};
</script>

<style scoped></style>
