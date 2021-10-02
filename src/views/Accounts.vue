<template>
  <Navbar />
  <DataTable
    :columns="columns"
    clickable
    fn="getAccountsByBalance"
    prefix="accounts"
  >
    <template v-slot:address="slotProps">
      <Copy :value="slotProps.row.address" :shrink="slotProps.shrink" />
    </template>
    <template v-slot:view="slotProps">
      <div class="flex">
        <Button
          value="View transactions"
          @click.stop.prevent="viewAccountTransactions(slotProps.row.address)"
        />
      </div>
    </template>
  </DataTable>
</template>

<script>
import { computed, inject, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { _transformMonetaryUnit } from '../utils';
import { DETAIL_MODAL } from '../components/modals/constants';

import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';
import Button from '../components/Button.vue';

export default {
  name: 'Accounts',
  setup() {
    const store = inject('store');
    const router = useRouter();

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
      {
        name: 'view',
        label: 'Inspect account',
        field: 'view',
        sortable: false,
        active: true,
        slot: true,
      },
    ]);

    return {
      columns,
      viewAccountTransactions: address =>
        router.push(`/accounts/${address}/transactions`),
    };
  },
  components: { DataTable, Navbar, Copy, Button },
};
</script>

<style scoped></style>
