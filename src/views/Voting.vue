<template>
  <Navbar />
  <div class="flex flex-gap mb-2">
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
  </div>
  <DataTable :columns="columns" :title="title" :fn="fn" />
</template>

<script>
import { onMounted, ref, computed, inject, reactive } from 'vue';

import Navbar from '../components/Navbar';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Section from '../components/Section';
import Input from '../components/Input';

import { _integerToDecimal } from '../utils';

export default {
  name: 'Home',
  setup() {
    const store = inject('store');

    const vote = reactive({ loading: false, error: null, data: null });

    const columns = ref([
      {
        name: 'rank',
        label: 'Rank',
        field: 'address',
        sortable: false,
        // TODO: Resolve this
        // value: (val, r) => `#${delegates.value.indexOf(r) + 1}`,
        active: true,
      },
      {
        name: 'address',
        label: 'Address',
        field: 'address',
        sortable: false,
        value: (val) => val,
        active: true,
      },
      {
        name: 'updateHeight',
        label: 'Height',
        field: 'updateHeight',
        sortable: false,
        value: (val) => new Intl.NumberFormat('be-NL').format(val),
        active: true,
      },
      {
        name: 'voteWeight',
        label: 'Vote weight',
        field: 'voteWeight',
        sortable: false,
        value: (val) => _integerToDecimal(val),
        active: true,
        shrinkable: false,
      },
      {
        name: 'voteWeight',
        label: 'Vote weight',
        field: 'voteWeight',
        sortable: false,
        value: (val) => 'Vote',
        active: store.state.authenticated,
      },
    ]);

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

    return {
      // vote: async () => await store.client.value.vote(),
      title: computed(() =>
        store.state.authenticated ? 'Voting for delegates' : 'Delegates',
      ),
      columns,
      fn: async () => await store.client.value.getForgingDelegates(),
      authenticated: computed(() => store.state.authenticated),
      vote,
    };
  },
  components: { Navbar, Button, DataTable, Input, Section },
};
</script>

<style scoped>
.delegate-address {
  color: var(--primary-lightest);
}
</style>
