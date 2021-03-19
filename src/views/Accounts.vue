<template>
  <Navbar />
  <DataTable
    :rows="accounts"
    :columns="columns"
    title="Accounts"
    @getData="loadMoreAccounts"
    :loading="loading"
    @sort="sort"
    clickable
    @detail="detail"
  />
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import Navbar from '../components/sections/Navbar.vue';
import DataTable from '../components/parts/DataTable.vue';
import { _integerToDecimal } from '../utils';
import { ACCOUNTS_MODAL } from '../components/modals/constants';

export default {
  name: 'Accounts',
  setup() {
    const store = useStore();

    const accounts = ref(null);

    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'Rank',
        label: 'rank',
        sortable: false,
        active: true,
        value: (val, r) => `#${accounts.value.indexOf(r) + 1}`,
      },
      {
        name: 'address',
        label: 'address',
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
        value: (val) => `${_integerToDecimal(val)} CLSK`,
        active: true,
        sorted: 'desc',
        noWrap: true,
      },
    ]);

    const offset = ref(0);
    const loading = ref(true);

    onMounted(async () => {
      accounts.value = await store.state.client.getAccountsByBalance(
        offset.value,
        50,
        'desc',
      );

      loading.value = false;
    });

    const loadMoreAccounts = async () => {
      if (loading.value) return;
      loading.value = true;

      offset.value = offset.value + 25;
      const t = await store.state.client.getAccountsByBalance(
        offset.value,
        25,
        'asc',
      );

      accounts.value = [...accounts.value, ...t];

      loading.value = false;
    };

    const sort = async (c, s) => {
      loading.value = true;

      const index = columns.value.findIndex((e) => e.field === c.field);
      c = { ...c, sorted: s };
      columns.value.splice(index, 1, c);

      accounts.value = await store.state.client.getAccountsByBalance(
        offset.value,
        50,
        s,
      );

      loading.value = false;
    };

    return {
      accounts,
      columns,
      loadMoreAccounts,
      loading,
      sort,
      detail: (account) =>
        store.commit('toggleModal', {
          type: ACCOUNTS_MODAL,
          data: account,
        }),
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
