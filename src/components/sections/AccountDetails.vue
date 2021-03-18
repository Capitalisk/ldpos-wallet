<template>
  <div class="flex flex-gap">
    <Section
      :loading="balance.loading"
      title="Current balance:"
      :needsAuthentication="true"
      :error="balance.error"
    >
      <h1>CⱠ {{ balance.data }}</h1>
    </Section>
    <Section
      :loading="transactions.loading"
      title="Latest transactions:"
      :needsAuthentication="true"
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
      :needsAuthentication="true"
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

import { _integerToDecimal } from '../../utils.js';

import Section from '../parts/Section';
import { useStore } from 'vuex';

export default {
  name: 'InfoBar',
  setup() {
    const store = useStore();

    const balance = ref({ loading: true, data: null, error: null });
    const transactions = ref({ loading: true, data: null, error: null });
    const pendingTransactions = ref({ loading: true, data: null, error: null });

    onMounted(async () => {
      try {
        if (store.state.authenticated) {
          const address = await store.state.client.getWalletAddress();

          try {
            const { balance: b } = await store.state.client.getAccount(address);
            balance.value.data = _integerToDecimal(b);
          } catch (err) {
            balance.value.error = err.message;
          }
          balance.value.loading = false;

          try {
            const t = await store.state.client.getTransactionsByTimestamp(
              0,
              10,
            );

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
            const pT = await store.state.client.getOutboundPendingTransactions(
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
