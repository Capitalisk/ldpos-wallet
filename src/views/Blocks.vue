<template>
  <Navbar />
  <DataTable
    :rows="blocks"
    :columns="columns"
    title="All blocks in the chain"
    @getData="loadMoreBlocks"
    :loading="loading"
    @sort="sort"
    clickable
    @detail="detail"
  />
</template>

<script>
import { computed, inject, onMounted, ref } from 'vue';

import Navbar from '../components/sections/Navbar.vue';
import DataTable from '../components/parts/DataTable.vue';
import { _integerToDecimal, _parseDate } from '../utils';
import { DETAIL_MODAL } from '../components/modals/constants';

export default {
  name: 'Blocks',
  setup() {
    const store = inject('store');

    const blocks = ref(null);

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
        value: (val) => _parseDate(val),
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
        class: 'address',
        active: true,
      },
    ]);

    const offset = ref(0);
    const loading = ref(true);

    onMounted(async () => {
      blocks.value = await store.client.value.getBlocksByTimestamp(
        offset.value,
        50,
        'desc',
      );

      loading.value = false;
    });

    const loadMoreBlocks = async () => {
      if (loading.value) return;
      loading.value = true;

      offset.value = offset.value + 50;
      const t = await store.client.value.getBlocksByTimestamp(
        offset.value,
        50,
        'desc',
      );

      blocks.value = [...blocks.value, ...t];

      loading.value = false;
    };

    const sort = async (c, s) => {
      loading.value = true;

      const index = columns.value.findIndex((e) => e.field === c.field);
      c = { ...c, sorted: s };
      columns.value.splice(index, 1, c);

      blocks.value = await store.client.value.getBlocksByTimestamp(
        offset.value,
        50,
        s,
      );

      loading.value = false;
    };

    return {
      blocks,
      columns,
      loadMoreBlocks,
      loading,
      sort,
      detail: (block) =>
        store.toggleModal({
          type: DETAIL_MODAL,
          data: block,
        }),
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
