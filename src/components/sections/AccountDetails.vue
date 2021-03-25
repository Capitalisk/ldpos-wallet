<template>
  <div class="flex flex-wrap flex-gap">
    <Section
      :loading="address.loading"
      title="Wallet address"
      :error="address.error"
      v-if="authenticated"
    >
      <Copy class="mb-auto" :value="address.data" trim />
    </Section>
    <Section v-else title="Generate a wallet:">
      <Button value="Generate" class="mb-auto mt-4" />
    </Section>
    <Section
      :loading="balance.loading"
      title="Current balance"
      :needsAuthentication="true"
      :error="balance.error"
      v-if="authenticated"
    >
      <h2 class="mb-auto">{{ balance.data }}</h2>
      <Button value="Send" class="mt-4" />
    </Section>
    <Section
      :loading="transactions.loading"
      title="Latest transactions"
      :error="transactions.error"
      v-if="authenticated"
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
    <Section title="Quick vote:" v-if="authenticated">
      <Input
        v-model="vote"
        placeholder="Wallet address"
        backgroundColor="primary-darkest"
        class="my-1"
      />
      <Button value="Vote" />
    </Section>
    <Section :title="`${token} Value`">
      <ul>
        <li>{{ token }}/USD: <strong>500 USD</strong></li>
        <li>{{ token }}/EUR: <strong>500 EUR</strong></li>
        <li>{{ token }}/LSK: <strong>500 LSK</strong></li>
        <li>{{ token }}/BTC: <strong>500 BTC</strong></li>
      </ul>
    </Section>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed } from 'vue';

import { _transformMonetaryUnit } from '../../utils.js';

import Section from '../parts/Section';
import Copy from '../parts/Copy';
import Button from '../parts/Button';
import Input from '../parts/Input';

export default {
  name: 'InfoBar',
  setup() {
    const store = inject('store');

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
            address.value.data = await store.client.value.getWalletAddress();
          } catch (e) {
            address.value.error = e;
          }
          address.value.loading = false;

          try {
            const { balance: b } = await store.client.value.getAccount(
              address.value.data,
            );
            balance.value.data = _transformMonetaryUnit(b);
          } catch (err) {
            balance.value.error = err.message;
          }
          balance.value.loading = false;

          try {
            const t = await store.client.value.getTransactionsByTimestamp(
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

    const vote = ref(null);

    return {
      balance,
      transactions,
      address,
      types,
      vote,
      authenticated: computed(() => store.state.authenticated),
      token: computed(() => store.state.config.networkSymbol.toString().toUpperCase()),
    };
  },
  components: { Section, Copy, Button, Input },
};
</script>
