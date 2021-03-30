<template>
  <Navbar />
  <div class="flex flex-wrap flex-gap">
    <template v-if="authenticated">
      <Section
        :loading="address.loading"
        title="Wallet address"
        :error="address.error"
        v-if="authenticated"
        class="flex-3"
      >
        <Copy class="mb-auto" :value="address.data" trim />
      </Section>
      <Section
        :loading="balance.loading"
        title="Current balance"
        :needsAuthentication="true"
        :error="balance.error"
        v-if="authenticated"
        class="flex-3"
      >
        <h2 class="mb-auto">{{ balance.data }}</h2>
        <Button value="Send" class="mt-4" @click="openTransferModal" />
      </Section>
      <Section
        :loading="transactions.loading"
        title="Latest transactions"
        :error="transactions.error"
        v-if="authenticated"
        class="flex-3"
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
      <Section title="Quick vote" v-if="authenticated" class="flex-3">
        <Input
          v-model="vote"
          placeholder="Wallet address"
          class="my-1"
          background-color="primary-darkest"
        />
        <Button value="Vote" @click="voteForDelegate" />
      </Section>
      <Section :title="`${token} Value`" v-if="false" class="flex-3">
        <ul>
          <li>{{ token }}/USD: <strong>500 USD</strong></li>
          <li>{{ token }}/EUR: <strong>500 EUR</strong></li>
          <li>{{ token }}/LSK: <strong>500 LSK</strong></li>
          <li>{{ token }}/BTC: <strong>500 BTC</strong></li>
        </ul>
      </Section>
    </template>

    <template v-else>
      <Section v-if="!address.data" title="Generate a wallet" class="flex-3">
        <span class="text-error" v-if="generatedWalletAddress.error">
          {{ generatedWalletAddress.error }}
        </span>
        <span v-else-if="generatedWalletAddress.data">
          <p class="text-error pb-2">
            <strong>IMPORTANT:</strong><br />
            Write this down in a safe place!<br />
            Losing the passphrase is losing its assets as well!
          </p>
          <strong>Address</strong>
          <Copy :value="generatedWalletAddress.data.address" /><br />
          <strong>Passphrase</strong>
          <Copy :value="generatedWalletAddress.data.passphrase" />
        </span>
        <div class="flex justify-center">
          <div>
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
          </div>
        </div>
      </Section>
      <Section
        class="flex-12"
        title="Login"
        v-if="!generatedWalletAddress.data && !authenticated"
      >
        <Login />
      </Section>
    </template>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed, reactive, onUpdated } from 'vue';

import { _transformMonetaryUnit } from '../utils.js';

import Navbar from '../components/sections/Navbar';
import Section from '../components/parts/Section';
import Copy from '../components/parts/Copy';
import Button from '../components/parts/Button';
import Input from '../components/parts/Input';
import Login from '../components/parts/Login';
import { TRANSFER_MODAL } from '../components/modals/constants.js';

export default {
  name: 'Dashboard',
  setup() {
    const store = inject('store');

    const vote = ref(null);
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

    const getWalletAddress = async () => {
      try {
        address.data = await store.client.value.getWalletAddress();
      } catch (e) {
        address.error = e;
      }
      address.loading = false;
    };

    const getBalance = async () => {
      try {
        const { balance: b } = await store.client.value.getAccount(
          address.data,
        );
        balance.data = _transformMonetaryUnit(b);
      } catch (err) {
        console.error(err)
        balance.error = err.message;
      }
      balance.loading = false;
    };

    const getTransactions = async () => {
      try {
        const t = await store.client.value.getTransactionsByTimestamp(0, 10);

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
    };

    onUpdated(async () => {
      try {
        if (store.state.authenticated) {
          await getWalletAddress();
          await getBalance();
          await getTransactions();
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

    const voteForDelegate = async () => {
      console.log('voteForDelegate');
    };

    const openTransferModal = () => {
      store.toggleModal({ type: TRANSFER_MODAL });
    };

    return {
      balance: computed(() => balance),
      transactions: computed(() => transactions),
      address: computed(() => address),
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
          console.log(e);
          generatedWalletAddress.error = e.message;
        }
        generatedWalletAddress.loading = false;
      },

      generatedWalletAddress,
      voteForDelegate,
      openTransferModal,
      login: async () => {
        await store.authenticate(generatedWalletAddress.data.passphrase);
        await getWalletAddress();
        await getBalance();
        await getTransactions();
      },
    };
  },
  components: { Section, Copy, Button, Input, Navbar, Login },
  mounted() {
    this.$forceUpdate();
  },
};
</script>
