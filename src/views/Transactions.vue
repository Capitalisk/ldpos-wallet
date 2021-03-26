<template>
  <Navbar />
  <DataTable
    :rows="transactions"
    :columns="columns"
    title="All transactions on the chain"
    @getData="loadMoreTransactions"
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
import { _transformMonetaryUnit, _parseDate } from '../utils';
import { DETAIL_MODAL } from '../components/modals/constants';

export default {
  name: 'Transactions',
  setup() {
    const store = inject('store');

    const transactions = ref(null);

    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'senderAddress',
        label: 'Sender',
        field: 'senderAddress',
        sortable: false,
        class: 'address',
        active: true,
      },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        field: 'recipientAddress',
        sortable: false,
        class: 'address',
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
        name: 'amount',
        label: 'Amount',
        field: 'amount',
        sortable: false,
        value: (val) =>
          _transformMonetaryUnit(val, store.state.config.networkSymbol),
        active: true,
      },
      {
        name: 'fee',
        label: 'Fee',
        field: 'fee',
        sortable: false,
        value: (val) =>
          _transformMonetaryUnit(val, store.state.config.networkSymbol),
        active: true,
      },
    ]);

    const offset = ref(0);
    const loading = ref(true);

    onMounted(async () => {
      transactions.value = await store.client.value.getTransactionsByTimestamp(
        offset.value,
        50,
        'desc',
      );

      loading.value = false;
    });

    const loadMoreTransactions = async () => {
      if (loading.value) return;
      loading.value = true;

      offset.value = offset.value + 25;
      const t = await store.client.value.getTransactionsByTimestamp(
        offset.value,
        25,
        'asc',
      );

      transactions.value = [...transactions.value, ...t];

      loading.value = false;
    };

    const sort = async (c, s) => {
      loading.value = true;

      const index = columns.value.findIndex((e) => e.field === c.field);
      c = { ...c, sorted: s };
      columns.value.splice(index, 1, c);

      transactions.value = await store.client.value.getTransactionsByTimestamp(
        offset.value,
        50,
        s,
      );

      loading.value = false;
    };

    return {
      transactions,
      columns,
      loadMoreTransactions,
      loading,
      sort,
      detail: (transaction) =>
        store.toggleModal({
          type: DETAIL_MODAL,
          data: transaction,
        }),
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
