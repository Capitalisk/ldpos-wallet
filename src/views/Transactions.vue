<template>
  <Navbar :title="title" />
  <DataTable
    :columns="columns"
    clickable
    order="desc"
    fn="getTransactionsByTimestamp"
    prefix="transactions"
  >
    <template v-slot:id="slotProps">
      <Copy
        :value="slotProps.row.id"
        :shrink="slotProps.shrink"
        :link="`/transactions/${slotProps.row.id}`"
      />
    </template>
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

<script setup>
import { inject, ref } from 'vue';

import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';
import { _transformMonetaryUnit, _parseDate } from '../utils';

defineProps({
  title: { type: String, required: true },
});

const store = inject('store');

const columns = ref([
  // { name: 'type', label: 'type', field: 'type', sortable: false },
  {
    name: 'id',
    label: 'Id',
    field: 'id',
    sortable: false,
    active: true,
    slot: true,
    shrinkUntilWidth: 2100,
  },
  {
    name: 'senderAddress',
    label: 'Sender',
    field: 'senderAddress',
    sortable: false,
    active: true,
    slot: true,
    shrinkUntilWidth: 1800,
    hideOnMobile: true,
  },
  {
    name: 'recipientAddress',
    label: 'Recipient',
    field: 'recipientAddress',
    sortable: false,
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
    value: val => _parseDate(val),
    active: true,
    sorted: 'desc',
    hideOnMobile: true,
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    sortable: false,
    value: val => _transformMonetaryUnit(val, store.state.config.networkSymbol),
    active: true,
    shrinkUntilWidth: 768,
  },
  {
    name: 'fee',
    label: 'Fee',
    field: 'fee',
    sortable: false,
    value: val => _transformMonetaryUnit(val, store.state.config.networkSymbol),
    active: true,
    hideOnMobile: true,
  },
]);
</script>

<style scoped></style>
