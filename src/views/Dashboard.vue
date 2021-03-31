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
        <ul v-if="transactions.data.length">
          <template
            v-for="transaction in transactions.data"
            :key="transaction.id"
          >
            <li class="lineheight-3 font-12">
              <div class="flex align-center">
                <i
                  :class="
                    `fas fa-${directions[transaction.direction]} mr-1 ${
                      transaction.direction === 'INBOUND'
                        ? 'text-success'
                        : 'text-error'
                    }`
                  "
                ></i>
                <strong>{{ transaction.amount }}</strong
                >&nbsp;
                {{ transaction.direction === 'INBOUND' ? 'from' : 'to' }}&nbsp;
                <strong
                  ><Copy
                    :value="
                      transaction.direction === 'INBOUND'
                        ? transaction.senderAddress
                        : transaction.recipientAddress
                    "
                    trim
                /></strong>
                <hr />
              </div>
            </li>
          </template>
        </ul>
        <p v-else>No latest transactions available</p>
      </Section>
      <Section title="Quick vote" v-if="authenticated" class="flex-3">
        <div v-if="vote.error" class="text-error">{{ vote.error }}</div>
        <Input
          v-model="vote.data"
          placeholder="Wallet address"
          class="my-1"
          background-color="primary-darkest"
        />
        <Button value="Vote" @click="voteForDelegate" :loading="vote.loading" />
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
import { inject, computed, reactive, watch, onMounted } from 'vue';

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

    const vote = reactive({ data: null, error: null, loading: null });
    const balance = reactive({ loading: true, data: null, error: null });
    const transactions = reactive({ loading: true, data: null, error: null });
    const address = reactive({ loading: true, data: null, error: null });
    const generatedWalletAddress = reactive({
      loading: false,
      data: null,
      error: null,
    });

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
        if (err.sourceError.name === 'AccountDidNotExistError') {
          if (
            store.client.value.validatePassphrase(store.client.value.passphrase)
          ) {
            balance.data = _transformMonetaryUnit('0');
            balance.loading = false;
            return;
          }
        }
        balance.error = err.message;
      }
      balance.loading = false;
    };

    const getTransactions = async () => {
      try {
        const inboundTransactions = await store.client.value.getInboundTransactions(
          store.client.value.getWalletAddress(),
          null,
          5,
          'asc',
        );
        const outboundTransactions = await store.client.value.getOutboundTransactions(
          store.client.value.getWalletAddress(),
          null,
          5,
          'asc',
        );

        const t = [
          ...inboundTransactions.map((t) => ({ ...t, direction: 'INBOUND' })),
          ...outboundTransactions.map((t) => ({ ...t, direction: 'OUTBOUND' })),
        ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

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

    const initializeWallet = async () => {
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
    };

    onMounted(async () => await initializeWallet());

    watch(
      () => store.state.authenticated,
      async () => await initializeWallet(),
    );

    const voteForDelegate = async () => {
      vote.loading = true;
      if (!vote.data) {
        vote.error = 'Field required.';
        return;
      }

      try {
        vote.error = null;
        const { minTransactionFees } = await store.client.value.getMinFees();
        const valid = await store.client.value.getDelegate(vote.data);

        if (!valid) {
          vote.error = 'Delegate does not exist.';
          return;
        }

        const voteTxn = await store.client.value.prepareTransaction({
          type: 'vote',
          delegateAddress: vote.data,
          fee: minTransactionFees.vote,
          timestamp: Date.now(),
          message: '',
        });

        await store.client.value.postTransaction(voteTxn);
        store.notify(`You have voted for ${vote.data}`, 5);
      } catch (e) {
        vote.error = e.message;
      }
      vote.loading = false;
    };

    const openTransferModal = () => {
      store.toggleModal({ type: TRANSFER_MODAL });
    };

    const generateWallet = async () => {
      generatedWalletAddress.loading = true;
      await new Promise((res) => setTimeout(() => res(), 500));
      try {
        if (!generatedWalletAddress.data)
          generatedWalletAddress.data = await store.client.value.generateWallet();
        else return;
      } catch (e) {
        console.log(e);
        generatedWalletAddress.error = e.message;
      }
      generatedWalletAddress.loading = false;
    };

    return {
      balance: computed(() => balance),
      transactions: computed(() => transactions),
      address: computed(() => address),
      directions: {
        OUTBOUND: 'chevron-up',
        INBOUND: 'chevron-down',
      },
      vote,
      authenticated: computed(() => store.state.authenticated),
      token: computed(() =>
        store.state.config.networkSymbol.toString().toUpperCase(),
      ),
      loggingIn: computed(() => store.state.login.loading),
      generateWallet,
      generatedWalletAddress,
      voteForDelegate,
      openTransferModal,
      login: async () =>
        await store.authenticate(generatedWalletAddress.data.passphrase),
    };
  },
  components: { Section, Copy, Button, Input, Navbar, Login },
  mounted() {
    this.$forceUpdate();
  },
};
</script>
