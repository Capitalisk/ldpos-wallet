<template>
  <Navbar />
  <DataTable
    :columns="columns"
    clickable
    fn="getBlocksByTimestamp"
    prefix="blocks"
  >
    <template v-slot:forgerAddress="slotProps">
      <Copy :value="slotProps.row.forgerAddress" :shrink="slotProps.shrink" />
    </template>
  </DataTable>
</template>

<script>
import { computed, inject, onMounted, ref } from 'vue';

import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';
import { _integerToDecimal, _parseDate } from '../utils';
import { DETAIL_MODAL } from '../components/modals/constants';

export default {
  name: 'Blocks',
  setup() {
    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'height',
        label: 'Height',
        field: 'height',
        sortable: false,
        active: true,
      },
      {
        name: 'timestamp',
        label: 'Date',
        field: 'timestamp',
        sortable: true,
        value: val => _parseDate(val),
        active: true,
        sorted: 'desc',
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
