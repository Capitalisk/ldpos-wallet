<template>
  <Navbar :title="title" />
  <DataTable
    :columns="columns"
    clickable
    fn="getBlocksByTimestamp"
    prefix="blocks"
  >
    <template v-slot:height="slotProps">
      <Copy :value="slotProps.row.height" />
    </template>
    <template v-slot:forgerAddress="slotProps">
      <Copy
        :value="slotProps.row.forgerAddress"
        :shrink="slotProps.shrink"
        :link="`/accounts/${slotProps.row.forgerAddress}`"
      />
    </template>
  </DataTable>
</template>

<script>
import { ref } from 'vue';

import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';
import { _integerToDecimal, _parseDate } from '../utils';

export default {
  name: 'Blocks',
  props: {
    title: { type: String, required: true },
  },
  setup() {
    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'height',
        label: 'Height',
        field: 'height',
        sortable: true,
        active: true,
        slot: true,
        sorted: 'desc',
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
        name: 'numberOfTransactions',
        label: 'Transactions',
        field: 'numberOfTransactions',
        sortable: false,
        active: true,
      },
      {
        name: 'forgerAddress',
        label: 'Forger',
        field: 'forgerAddress',
        sortable: false,
        active: true,
        slot: true,
        hideOnMobile: true,
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
