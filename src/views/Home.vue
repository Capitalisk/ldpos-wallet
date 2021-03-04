<template>
  <div class="section">
    <strong>Current balance:</strong><br />
    <p v-if="!balance.loading">
      {{ balance.data }}
    </p>
    <Loading v-else />
    <!-- <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
  <div class="section flex-gap">
    Latest transactions: <br />
    <ul v-if="!transactions.loading">
      <li v-for="transaction in transactions.data" :key="transaction.id">
        {{ transaction.type }} for {{ transaction.amount }} with a
        {{ transaction.fee }} fee
      </li>
    </ul>
    <Loading v-else />
  </div>
</template>

<script>
import Loading from '../components/Loading';
import { ref, onMounted } from 'vue';
import ldposClient from 'ldpos-client';
import { _integerToDecimal } from '../utils.js';

export default {
  name: 'Home',
  setup() {
    const config = {
      hostname: '34.227.22.98',
      port: '7001',
      passphrase:
        'oval moral close neck table curtain focus chronic april add clown differ',
      networkSymbol: 'clsk',
      chainModuleName: 'capitalisk_chain',
    };

    const balance = ref({ loading: true, data: null });
    const transactions = ref({ loading: true, data: null });
    const error = ref(null);

    onMounted(async () => {
      try {
        const client = await ldposClient.createClient(config);

        await client.connect({
          passphrase: config.passphrase,
        });

        const address = await client.getWalletAddress();

        const { balance: b } = await client.getAccount(address);
        balance.value.data = _integerToDecimal(b);
        balance.value.loading = false;

        const t = await client.getTransactionsByTimestamp(0, 10);

        transactions.value.data = t.map((transaction) => {
          debugger;
          return {
            ...transaction,
            amount: _integerToDecimal(transaction.amount),
            fee: _integerToDecimal(transaction.fee),
          };
        });

        transactions.value.loading = false;
      } catch (e) {
        console.error(e);
        error.value = e.message;
      }
    });

    return {
      balance,
      error,
      transactions,
    };
  },
  components: {
    Loading,
  },
};
</script>
