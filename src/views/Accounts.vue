<template>
  <Navbar />
  <DataTable
    :columns="columns"
    title="All accounts in the chain"
    clickable
    fn="getAccountsByBalance"
  />
</template>

<script>
import { computed, inject, onMounted, ref } from 'vue';

import Navbar from '../components/Navbar.vue';
import DataTable from '../components/DataTable.vue';
import { _transformMonetaryUnit } from '../utils';
import { DETAIL_MODAL } from '../components/modals/constants';

export default {
  name: 'Accounts',
  setup() {
    const store = inject('store');

    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'rank',
        label: 'Rank',
        sortable: false,
        active: true,
        // TODO: Fix this
        // value: (val, r, rows) => `#${rows.value.indexOf(r) + 1}`,
      },
      {
        name: 'address',
        label: 'Address',
        field: 'address',
        sortable: false,
        class: 'address',
        active: true,
      },
      {
        name: 'balance',
        label: 'Balance',
        field: 'balance',
        sortable: false,
        value: (val) =>
          _transformMonetaryUnit(val, store.state.config.networkSymbol),
        active: true,
        sorted: 'desc',
        shrinkable: false,
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
