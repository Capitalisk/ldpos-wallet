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

<script setup>
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import { _transformMonetaryUnit } from '../utils';

import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';
import Button from '../components/Button.vue';

defineProps({
  title: { type: String, required: true },
});

const store = inject('store');
const router = useRouter();

const columns = ref([
  // { name: 'type', label: 'type', field: 'type', sortable: false },
  {
    name: 'rank',
    label: 'Rank',
    field: 'rank',
    sortable: false,
    value: (val, r, rows, offset) => `#${rows.indexOf(r) + 1 + offset}`,
    active: true,
    hideOnMobile: true,
  },
  {
    name: 'address',
    label: 'Address',
    field: 'address',
    sortable: false,
    active: true,
    slot: true,
    shrinkUntilWidth: 992,
  },
  {
    name: 'balance',
    label: 'Balance',
    field: 'balance',
    sortable: false,
    value: val => _transformMonetaryUnit(val, store.state.config.networkSymbol),
    active: true,
    sorted: 'desc',
    shrinkUntilWidth: 768,
  },
]);

// TODO: Remove?
const viewAccountTransactions = address =>
  router.push(`/accounts/${address}/transactions`);
const getVotes = async account => {
  const votes = await store.client.value.getAccountVotes(account.address);

  return { key: 'votes', value: votes };
};
</script>

<style scoped></style>
