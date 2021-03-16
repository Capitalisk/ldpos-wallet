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
import { onMounted, ref } from 'vue';
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
      { name: 'id', label: 'ID', field: 'id', sortable: false },
      { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: 'recipientAddress',
        label: 'recipientAddress',
        field: 'recipientAddress',
        sortable: false,
      },
      {
        name: 'amount',
        label: 'amount',
        field: 'amount',
        sortable: false,
        value: (val) => _integerToDecimal(val),
      },
      {
        name: 'fee',
        label: 'fee',
        field: 'fee',
        sortable: false,
        value: (val) => _integerToDecimal(val),
      },
      {
        name: 'timespamp',
        label: 'timespamp',
        field: 'timespamp',
        sortable: false,
      },
      { name: 'message', label: 'message', field: 'message', sortable: false },
      {
        name: 'senderAddress',
        label: 'senderAddress',
        field: 'senderAddress',
        sortable: false,
      },
      {
        name: 'sigPublicKey',
        label: 'sigPublicKey',
        field: 'sigPublicKey',
        sortable: false,
      },
      {
        name: 'nextSigPublicKey',
        label: 'nextSigPublicKey',
        field: 'nextSigPublicKey',
        sortable: false,
      },
      {
        name: 'senderSignatureHash',
        label: 'senderSignatureHash',
        field: 'senderSignatureHash',
        sortable: false,
      },
      { name: 'blockId', label: 'blockId', field: 'blockId', sortable: false },
      {
        name: 'indexInBlock',
        label: 'indexInBlock',
        field: 'indexInBlock',
        sortable: false,
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
      offset.value = offset.value + 50;
      const t = await store.state.client.getTransactionsByTimestamp(
        offset.value,
        50,
        'asc',
      );

      transactions.value = [...transactions.value, ...t];

      loading.value = false;
    };

    return {
      transactions,
      columns,
      loadMoreTransactions,
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
