<template>
  <NavBar />
  <AccountDetails />
  <div class="wallet">
    <p>
      {{ walletAddress }}
    </p>
    <table>
      <thead>
        <th>Id</th>
        <th>Type</th>
        <th>Recipient Address</th>
        <th>Amount</th>
        <th>Fee</th>
        <th>Timestamp</th>
        <th>Message</th>
        <th>Sender Address</th>
      </thead>
      <tr
        v-for="{
          id,
          type,
          recipientAddress,
          amount,
          fee,
          timestamp,
          message,
          senderAddress,
        } in transactions"
        :key="id"
      >
        <td>{{ id }}</td>
        <td>{{ type }}</td>
        <td>{{ recipientAddress }}</td>
        <td>{{ amount }}</td>
        <td>{{ fee }}</td>
        <td>{{ timestamp }}</td>
        <td>{{ message }}</td>
        <td>{{ senderAddress }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { useClient } from '../plugins/ldpos-client';

import AccountDetails from '../components/sections/AccountDetails';
import NavBar from '../components/sections/NavBar';
import { onMounted, ref } from '@vue/runtime-core';

export default {
  name: 'Home',
  components: { AccountDetails, NavBar },
  setup() {
    const walletAddress = ref(null);
    const transactions = ref([]);

    onMounted(async () => {
      const { network } = useClient();

      walletAddress.value = network.getWalletAddress();
      transactions.value = await network.getTransactionsByTimestamp(
        0,
        20,
        'asc',
      );
    });

    return {
      walletAddress,
      transactions,
    };
  },
};
</script>

<style scoped>
.wallet {
  width: 100%;
}
</style>
