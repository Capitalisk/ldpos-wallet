<template>
  <Navbar />
  <DataTable
    :rows="transactions"
    :columns="columns"
    title="Transactions"
    @getData="loadMoreTransactions"
    :loading="loading"
  />
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import Navbar from '../components/sections/Navbar.vue';
import DataTable from '../components/parts/DataTable.vue';
import { _integerToDecimal } from '../utils';

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
        sortable: false,
        value: (val) =>
          new Intl.DateTimeFormat('nl-BE', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(val)),
        active: true,
      },
      {
        name: 'amount',
        label: 'amount',
        field: 'amount',
        sortable: false,
        value: (val) => _integerToDecimal(val),
        active: true,
      },
      {
        name: 'fee',
        label: 'fee',
        field: 'fee',
        sortable: false,
        value: (val) => _integerToDecimal(val),
        active: true,
      },
    ]);

    const offset = ref(0);
    const loading = ref(true);

    onMounted(async () => {
      transactions.value = await store.state.client.getTransactionsByTimestamp(
        offset.value,
        50,
        'asc',
      );

      loading.value = false;
    });

    const loadMoreTransactions = async () => {
      if (loading.value) return;
      loading.value = true;

      console.log('fire');

      offset.value = offset.value + 25;
      const t = await store.state.client.getTransactionsByTimestamp(
        offset.value,
        25,
        'asc',
      );

      transactions.value = [...transactions.value, ...t];

      loading.value = false;
    };

    return {
      transactions,
      columns,
      loadMoreTransactions,
      loading,
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
