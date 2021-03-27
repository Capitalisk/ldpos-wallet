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
      <span class="text-error" v-if="generatedWalletAddress.error">
        {{ generatedWalletAddress.error }}
      </span>
      <span v-else-if="generatedWalletAddress.data">
        <p class="text-error pb-2">
          <strong>IMPORTANT:</strong><br />
          Write this down in a safe place!<br />
          Losing the passphrase is losing it's assets as well!
        </p>
        <strong>Address:</strong>
        <Copy :value="generatedWalletAddress.data.address" /><br />
        <strong>Passphrase:</strong>
        <Copy :value="generatedWalletAddress.data.passphrase" />
      </span>
      <Button
        v-if="!generatedWalletAddress.data"
        value="Generate"
        class="mb-auto mt-4"
        @click="generateWallet"
        :loading="generatedWalletAddress.loading"
      />
      <Button
        v-else
        :value="loggingIn ? 'Hang in there...' : 'Login'"
        class="mb-auto mt-4"
        :background-color="loggingIn ? 'warning' : 'success'"
        @click="login"
        :loading="loggingIn"
      />
    </Section>
    <Section
      :loading="balance.loading"
      title="Current balance"
      :needsAuthentication="true"
      :error="balance.error"
      v-if="authenticated"
    >
      <h2 class="mb-auto">{{ balance.data }}</h2>
      <Button value="Send" class="mt-4" @click="openTransferModal" />
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
      <Button value="Vote" @click="voteForDelegate" />
    </Section>
    <Section :title="`${token} Value`" v-if="false">
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
import { ref, onMounted, inject, computed, reactive } from 'vue';

import { _transformMonetaryUnit } from '../../utils.js';

import Section from '../parts/Section';
import Copy from '../parts/Copy';
import Button from '../parts/Button';
import Input from '../parts/Input';

export default {
  name: 'InfoBar',
  setup() {
    const store = inject('store');

    const balance = reactive({ loading: true, data: null, error: null });
    const transactions = reactive({ loading: true, data: null, error: null });
    const address = reactive({ loading: true, data: null, error: null });
    const generatedWalletAddress = reactive({
      loading: false,
      data: null,
      error: null,
    });

    const types = {
      transfer: 'exchange-alt',
      vote: 'poll',
    };

    onMounted(async () => {
      try {
        if (store.state.authenticated) {
          try {
            address.data = await store.client.value.getWalletAddress();
          } catch (e) {
            address.error = e;
          }
          address.loading = false;

          try {
            const { balance: b } = await store.client.value.getAccount(
              address.data,
            );
            balance.data = _transformMonetaryUnit(b);
          } catch (err) {
            balance.error = err.message;
          }
          balance.loading = false;

          try {
            const t = await store.client.value.getTransactionsByTimestamp(
              0,
              10,
            );

            transactions.data = t
              .filter((transaction) => transaction.amount)
              .map((transaction) => ({
                ...transaction,
                amount: _transformMonetaryUnit(transaction.amount),
                fee: _transformMonetaryUnit(transaction.fee),
              }));
          } catch (err) {
            transactions.error = err.message;
          }
          transactions.loading = false;
        } else {
          balance.loading = false;
          balance.data = null;
          balance.error = null;
          transactions.loading = false;
          transactions.data = null;
          transactions.error = null;
          address.loading = false;
          address.data = null;
          address.error = null;
        }
      } catch (e) {
        console.error(e);
      }
    });

    const vote = ref(null);

    const voteForDelegate = async () => {
      console.log('voteForDelegate');
    };

    const openTransferModal = () => {
      console.log('openTransferModal');
    };

    return {
      balance,
      transactions,
      address,
      types,
      vote,
      authenticated: computed(() => store.state.authenticated),
      token: computed(() =>
        store.state.config.networkSymbol.toString().toUpperCase(),
      ),
      loggingIn: computed(() => store.state.login.loading),
      generateWallet: async () => {
        generatedWalletAddress.loading = true;
        try {
          if (!generatedWalletAddress.data)
            generatedWalletAddress.data = await store.client.value.generateWallet();
        } catch (e) {
          generatedWalletAddress.error = e.message;
        }
        generatedWalletAddress.loading = false;
      },
      generatedWalletAddress,
      voteForDelegate,
      openTransferModal,
      login: () => {
        address.data = generatedWalletAddress.data.address;
        store.authenticate(generatedWalletAddress.data.passphrase);
      },
    };
  },
  components: { Section, Copy, Button, Input },
};
</script>
