<template>
  <Section
    :loading="balance.loading"
    title="Current balance:"
    :error="balance.error"
  >
    <h1>CⱠ {{ balance.data }}</h1>
  </Section>
  <Section
    :loading="transactions.loading"
    title="Latest transactions:"
    :gap="true"
    :error="transactions.error"
  >
    <ul>
      <li v-for="transaction in transactions.data" :key="transaction.id">
        {{ transaction.type }} for CⱠ {{ transaction.amount }} with a CⱠ
        {{ transaction.fee }} fee
      </li>
    </ul>
  </Section>
  <Section
    :loading="pendingTransactions.loading"
    title="Pending transactions:"
    :gap="true"
    :error="pendingTransactions.error"
  >
    <ul>
      <li
        v-for="pendingTransaction in pendingTransactions.data"
        :key="pendingTransaction.id"
      >
        {{ pendingTransaction.type }} for CⱠ
        {{ pendingTransaction.amount }} with a CⱠ
        {{ pendingTransaction.fee }} fee
      </li>
    </ul>
  </Section>
</template>

<script>
import Section from '../components/Section';
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

    const balance = ref({ loading: true, data: null, error: null });
    const transactions = ref({ loading: true, data: null, error: null });
    const pendingTransactions = ref({ loading: true, data: null, error: null });

    onMounted(async () => {
      try {
        const client = await ldposClient.createClient(config);

        await client.connect({
          passphrase: config.passphrase,
        });

        const address = await client.getWalletAddress();

        try {
          const { balance: b } = await client.getAccount(address);
          balance.value.data = _integerToDecimal(b);
        } catch (err) {
          balance.value.error = err.message;
        }
        balance.value.loading = false;

        try {
          const t = await client.getTransactionsByTimestamp(0, 10);

          transactions.value.data = t
            .filter((transaction) => transaction.amount)
            .map((transaction) => ({
              ...transaction,
              amount: _integerToDecimal(transaction.amount),
              fee: _integerToDecimal(transaction.fee),
            }));
        } catch (err) {
          transactions.value.error = err.message;
        }
        transactions.value.loading = false;

        try {
          const pT = await client.getOutboundPendingTransactions(address, 0, 5);

          pendingTransactions.value.data = pT;
        } catch (err) {
          console.error(err);
          debugger;
          pendingTransactions.value.error = err.message;
        }
        pendingTransactions.value.loading = false;
      } catch (e) {
        console.error(e);
      }
    });

    return {
      balance,
      transactions,
      pendingTransactions,
    };
  },
  components: {
    Section,
  },
};
</script>
