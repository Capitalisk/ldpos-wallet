<template>
  <Navbar />
  <DataTable
    :columns="columns"
    clickable
    fn="getAccountsByBalance"
    prefix="accounts"
    :prependFn="getVotes"
  >
    <template v-slot:address="slotProps">
      <Copy :value="slotProps.row.address" :shrink="slotProps.shrink" />
    </template>
  </DataTable>
</template>

<script>
import { computed, inject, ref } from 'vue';
import { _transformMonetaryUnit } from '../utils';
import { DETAIL_MODAL } from '../components/modals/constants';

import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';

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
        value: (val, r, rows) => `#${rows.indexOf(r) + 1}`,
      },
      {
        name: 'address',
        label: 'Address',
        field: 'address',
        sortable: false,
        active: true,
        slot: true,
      },
      {
        name: 'balance',
        label: 'Balance',
        field: 'balance',
        sortable: false,
        value: val =>
          _transformMonetaryUnit(val, store.state.config.networkSymbol),
        active: true,
        sorted: 'desc',
        shrinkable: false,
      },
    ]);

    return {
      columns,
      getVotes: async account => {
        const votes = await store.client.value.getAccountVotes(account.address);

        return { key: 'votes', value: votes };
      },
    };
  },
  components: { DataTable, Navbar, Copy },
};
</script>

<style scoped></style>
