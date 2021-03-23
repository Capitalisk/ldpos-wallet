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
      <h2 class="mb-auto">{{ balance.data }}</h2>
      <Button value="Send" />
    </Section>
    <Section
      :loading="transactions.loading"
      title="Latest transactions:"
      :needsAuthentication="true"
      :error="transactions.error"
    >
      <ul>
        <template
          v-for="transaction in transactions.data"
          :key="transaction.id"
        >
          <li class="lineheight-3">
            <i :class="`fas fa-${types[transaction.type]} mr-1`"></i>
            {{ transaction.amount }} with a {{ transaction.fee }} fee
          </li>
        </template>
      </ul>
    </Section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

import { _transformMonetaryUnit } from '../../utils.js';

import Section from '../parts/Section';
import Copy from '../parts/Copy';
import Button from '../parts/Button';

import { useStore } from 'vuex';

export default {
  name: 'InfoBar',
  setup() {
    const store = useStore();

    const balance = ref({ loading: true, data: null, error: null });
    const transactions = ref({ loading: true, data: null, error: null });
    const address = ref({ loading: true, data: null, error: null });

    const types = {
      transfer: 'exchange-alt',
      vote: 'poll',
    };

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
            const { balance: b } = await store.state.client.getAccount(
              address.value.data,
            );
            balance.value.data = _transformMonetaryUnit(b);
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
                amount: _transformMonetaryUnit(transaction.amount),
                fee: _transformMonetaryUnit(transaction.fee),
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
      types,
    };
  },
  components: { Section, Copy, Button },
};
</script>
