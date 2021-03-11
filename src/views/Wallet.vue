<template>
  <NavBar />
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
import { useClient } from '../plugins/ldpos-client';

import AccountDetails from '../components/sections/AccountDetails';
import NavBar from '../components/sections/NavBar';
import { onMounted, ref } from '@vue/runtime-core';
import { _integerToDecimal } from '../utils';

export default {
  name: 'Home',
  components: { AccountDetails, NavBar },
  setup() {
    const walletAddress = ref(null);
    const transactions = ref([]);
    const INBOUND = 'inbound';
    const OUTBOUND = 'outbound';

    onMounted(async () => {
      const { network } = useClient();

      walletAddress.value = network.getWalletAddress();

      const txns = await network.getTransactionsByTimestamp(
        0,
        20,
        'asc',
      );

      transaction.value = txns.map((el) => ({
        ...el,
        direction: el.recipientAddress !== walletAddress.value ? INBOUND : OUTBOUND,
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
