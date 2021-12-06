<template>
  <Navbar :title="title" />
  <DataTable
    :columns="columns"
    clickable
    fn="getAccountsByBalance"
    prefix="accounts"
    :prependFn="getVotes"
  >
    <template v-slot:address="slotProps">
      <Copy
        :value="slotProps.row.address"
        :shrink="slotProps.shrink"
        :link="`/accounts/${slotProps.row.address}`"
      />
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
  props: {
    title: { type: String, required: true },
  },
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
    ]);

    return {
      columns,
      viewAccountTransactions: address =>
        router.push(`/accounts/${address}/transactions`),
      getVotes: async account => {
        const votes = await store.client.value.getAccountVotes(account.address);

        return { key: 'votes', value: votes };
      },
    };
  },
  components: { DataTable, Navbar, Copy, Button },
};
</script>

<style scoped></style>
