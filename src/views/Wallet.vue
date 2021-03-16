<template>
  <Navbar />
  <AccountDetails />
  <div class="wallet">
    <p>
      {{ walletAddress }}
    </p>
    <table>
      <thead>
        <th>Direction</th>
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
          direction,
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
        <td>{{ direction }}</td>
        <td>{{ type }}</td>
        <td>{{ recipientAddress }}</td>
        <td>{{ _integerToDecimal(amount) }}</td>
        <td>{{ _integerToDecimal(fee) }}</td>
        <td>{{ timestamp }}</td>
        <td>{{ message }}</td>
        <td>{{ senderAddress }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import AccountDetails from '../components/sections/AccountDetails';
import Navbar from '../components/sections/Navbar';
import { _integerToDecimal } from '../utils';

export default {
  name: 'Home',
  components: { AccountDetails, Navbar },
  setup() {
    const walletAddress = ref(null);
    const transactions = ref([]);
    const INBOUND = 'inbound';
    const OUTBOUND = 'outbound';

    onMounted(async () => {
      const store = useStore();

      walletAddress.value = store.state.client.getWalletAddress();

      const txns = await store.state.client.getTransactionsByTimestamp(0, 20, 'asc');

      transactions.value = txns.map((el) => ({
        ...el,
        direction:
          el.recipientAddress !== walletAddress.value ? INBOUND : OUTBOUND,
      }));
    });

    return {
      walletAddress,
      transactions,
      _integerToDecimal,
    };
  },
};
</script>

<style scoped>
.wallet {
  width: 100%;
}
</style>
