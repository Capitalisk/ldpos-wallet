<template>
  <div class="flex flex-wrap flex-gap">
    <Section
      :loading="address.loading"
      title="Wallet address:"
      :needsAuthentication="true"
      :error="address.error"
    >
      <Copy :value="address.data" trim />
    </Section>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

import { _integerToDecimal } from '../../utils.js';

import Section from '../parts/Section';
import Copy from '../parts/Copy';

import { useStore } from 'vuex';

export default {
  name: 'InfoBar',
  setup() {
    const store = useStore();

    const balance = ref({ loading: true, data: null, error: null });
    const transactions = ref({ loading: true, data: null, error: null });
    const address = ref({ loading: true, data: null, error: null });

    onMounted(async () => {
      try {
        if (store.state.authenticated) {
          try {
            address.value.data = await store.state.client.getWalletAddress();
          } catch (e) {
            address.value.error = e;
          }
          address.value.loading = false;

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
        } else {
          balance.value = { loading: false, data: null, error: null };
          transactions.value = {
            loading: false,
            data: null,
            error: null,
          };
          address.value = { loading: false, data: null, error: null };
        }
      } catch (e) {
        console.error(e);
      }
    });

    return {
      balance,
      transactions,
      address,
    };
  },
  components: {
    Section,
    Copy,
  },
};
</script>
