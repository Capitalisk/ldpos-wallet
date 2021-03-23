<template>
  <Navbar />
  <DataTable
    :rows="blocks"
    :columns="columns"
    title="Blocks"
    @getData="loadMoreBlocks"
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
import { _integerToDecimal, _parseDate } from '../utils';
import { BLOCKS_MODAL } from '../components/modals/constants';

export default {
  name: 'Blocks',
  setup() {
    const store = useStore();

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
      blocks.value = await store.state.client.getBlocksByTimestamp(
        offset.value,
        50,
        'desc',
      );

      loading.value = false;
    });

    const loadMoreBlocks = async () => {
      if (loading.value) return;
      loading.value = true;

      offset.value = offset.value + 25;
      const t = await store.state.client.getBlocksByTimestamp(
        offset.value,
        25,
        'asc',
      );

      blocks.value = [...blocks.value, ...t];

      loading.value = false;
    };

    const sort = async (c, s) => {
      loading.value = true;

      const index = columns.value.findIndex((e) => e.field === c.field);
      c = { ...c, sorted: s };
      columns.value.splice(index, 1, c);

      blocks.value = await store.state.client.getBlocksByTimestamp(
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
        store.commit('toggleModal', {
          type: BLOCKS_MODAL,
          data: block,
        }),
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
