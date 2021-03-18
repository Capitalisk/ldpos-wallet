<template>
  <Navbar />
  <DataTable title="Wallet" :rows="transactions" :columns="columns" />
</template>

<script>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import AccountDetails from '../components/sections/AccountDetails';
import Navbar from '../components/sections/Navbar';
import DataTable from '../components/parts/DataTable';

import { _integerToDecimal } from '../utils';
import router from '../router';

export default {
  name: 'Home',
  setup() {
    const store = useStore();

    const walletAddress = ref(null);
    const transactions = ref([]);
    const INBOUND = 'inbound';
    const OUTBOUND = 'outbound';

    onMounted(async () => {
      if (!store.state.authenticated) {
        router.push('/');
        return;
      }

      walletAddress.value = store.state.client.getWalletAddress();

      transactions.value = await store.state.client.getTransactionsByTimestamp(
        0,
        50,
        'asc',
      );
    });

    const columns = ref([
      {
        name: 'direction',
        label: 'direction',
        field: 'direction',
        sortable: false,
        value: (val, r) =>
          r.recipientAddress !== walletAddress.value ? INBOUND : OUTBOUND,
      },
      {
        name: 'type',
        label: 'type',
        field: 'type',
        sortable: false,
      },
      {
        name: 'recipientAddress',
        label: 'recipientAddress',
        field: 'recipientAddress',
        sortable: false,
        value: (val) => val,
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
        name: 'timestamp',
        label: 'timestamp',
        field: 'timestamp',
        sortable: false,
        value: (val) => val,
      },
      {
        name: 'message',
        label: 'message',
        field: 'message',
        sortable: false,
        value: (val) => val,
      },
      {
        name: 'senderAddress',
        label: 'senderAddress',
        field: 'senderAddress',
        sortable: false,
        value: (val) => val,
      },
    ]);

    return {
      walletAddress,
      transactions,
      columns,
    };
  },
  components: { AccountDetails, Navbar, DataTable },
};
</script>

<style scoped>
.wallet {
  width: 100%;
}
</style>
