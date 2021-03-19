<template>
  <Navbar />
  <DataTable
    :rows="transactions"
    :columns="columns"
    title="Transactions"
    @getData="loadMoreTransactions"
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
import { TRANSACTION_MODAL } from '../components/modals/constants';

export default {
  name: 'Transactions',
  setup() {
    const store = useStore();

    const transactions = ref(null);

    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'senderAddress',
        label: 'senderAddress',
        field: 'senderAddress',
        sortable: false,
        class: 'address',
        active: true,
      },
      {
        name: 'recipientAddress',
        label: 'recipientAddress',
        field: 'recipientAddress',
        sortable: false,
        class: 'address',
        active: true,
      },
      {
        name: 'timestamp',
        label: 'timestamp',
        field: 'timestamp',
        sortable: true,
        value: (val) =>
          new Intl.DateTimeFormat('nl-BE', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(val)),
        active: true,
        sorted: 'desc',
      },
      {
        name: 'amount',
        label: 'amount',
        field: 'amount',
        sortable: false,
        value: (val) => (val ? `${_integerToDecimal(val)} CLSK` : null),
        active: true,
      },
      {
        name: 'fee',
        label: 'fee',
        field: 'fee',
        sortable: false,
        value: (val) => `${_integerToDecimal(val)} CLSK`,
        active: true,
      },
    ]);

    const offset = ref(0);
    const loading = ref(true);

    onMounted(async () => {
      transactions.value = await store.state.client.getTransactionsByTimestamp(
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
      const t = await store.state.client.getTransactionsByTimestamp(
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

      transactions.value = await store.state.client.getTransactionsByTimestamp(
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
        store.commit('toggleModal', {
          type: TRANSACTION_MODAL,
          data: transaction,
        }),
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
