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
import { ref, onMounted } from 'vue';

import { _integerToDecimal } from '../../utils.js';
import { useClient } from '../../plugins/ldpos-client';

import Section from '../parts/Section';

export default {
  name: 'InfoBar',
  setup() {
    // DATA
    const balance = ref({ loading: true, data: null, error: null });
    const transactions = ref({ loading: true, data: null, error: null });
    const pendingTransactions = ref({ loading: true, data: null, error: null });

    // MOUNTED
    onMounted(async () => {
      // MOUNTED CODE
      try {
        const client = ref(null);
        const { network, walletConnected } = useClient();
        client.value = network;

        if (walletConnected) {
          const address = await client.value.getWalletAddress();

          // METHOD GET BALANCE
          try {
            const { balance: b } = await client.value.getAccount(address);
            balance.value.data = _integerToDecimal(b);
          } catch (err) {
            balance.value.error = err.message;
          }
          balance.value.loading = false;

          // METHOD GET TRANSACTIONS
          try {
            const t = await client.value.getTransactionsByTimestamp(0, 10);

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

          // METHOD GET PENDING TRANSACTIONS
          try {
            const pT = await client.value.getOutboundPendingTransactions(
              address,
              0,
              5,
            );

            pendingTransactions.value.data = pT;
          } catch (err) {
            pendingTransactions.value.error = err.message;
          }
          pendingTransactions.value.loading = false;
        } else {
          balance.value = { loading: false, data: null, error: null };
          transactions.value = {
            loading: false,
            data: null,
            error: null,
          };
          pendingTransactions.value = {
            loading: false,
            data: null,
            error: null,
          };
        }
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
