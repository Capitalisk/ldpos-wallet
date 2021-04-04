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
      <div class="flex justify-center">
        <Button value="Vote" @click="voteForDelegate" :loading="vote.loading" />
      </div>
    </Section>
  </div>
  <DataTable :columns="columns" :title="title" :fn="fn">
    <template v-slot:vote="slotProps">
      <Button
        value="Vote"
        @click="voteForDelegate(slotProps.row.address)"
        :loading="votingForAddress === slotProps.row.address"
      />
    </template>
    <template v-slot:address="slotProps">
      <Copy :value="slotProps.row.address" />
    </template>
  </DataTable>
</template>

<script>
import { onMounted, ref, computed, inject, reactive } from 'vue';

import Navbar from '../components/Navbar';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Section from '../components/Section';
import Input from '../components/Input';
import Copy from '../components/Copy';

import { _integerToDecimal } from '../utils';

export default {
  name: 'Home',
  setup() {
    const store = inject('store');

    const vote = reactive({ loading: false, error: null, data: null });
    const votingForAddress = ref(null);

    const columns = ref([
      {
        name: 'rank',
        label: 'Rank',
        field: 'address',
        sortable: false,
        value: (val, r, rows) => `#${rows.indexOf(r) + 1}`,
        active: true,
      },
      {
        name: 'address',
        label: 'Address',
        field: 'address',
        sortable: false,
        value: val => val,
        active: true,
      },
      {
        name: 'updateHeight',
        label: 'Height',
        field: 'updateHeight',
        sortable: false,
        value: val => new Intl.NumberFormat('be-NL').format(val),
        active: true,
      },
      {
        name: 'voteWeight',
        label: 'Vote weight',
        field: 'voteWeight',
        sortable: false,
        value: val => _integerToDecimal(val),
        active: true,
        shrinkable: false,
      },
      {
        name: 'vote',
        label: 'Vote for delegate',
        sortable: false,
        value: val => 'Vote',
        active: store.state.authenticated,
        slot: true,
      },
    ]);

    const voteForDelegate = async wallet => {
      if (!wallet) vote.loading = true;
      else votingForAddress.value = wallet;

      let voteTxn;

      const { minTransactionFees } = await store.client.value.getMinFees();

      try {
        if (wallet) {
          const valid = await store.client.value.getDelegate(wallet);

          voteTxn = await store.client.value.prepareTransaction({
            type: 'vote',
            delegateAddress: wallet,
            fee: minTransactionFees.vote,
            timestamp: Date.now(),
            message: '',
          });
        } else {
          if (!vote.data) {
            vote.error = 'Field required.';
            return;
          }

          vote.error = null;
          const valid = await store.client.value.getDelegate(vote.data);

          if (!valid) {
            vote.error = 'Delegate does not exist.';
            return;
          }

          voteTxn = await store.client.value.prepareTransaction({
            type: 'vote',
            delegateAddress: vote.data,
            fee: minTransactionFees.vote,
            timestamp: Date.now(),
            message: '',
          });
        }

        await store.client.value.postTransaction(voteTxn);
        store.notify(`You have voted for ${vote.data}`, 5);
      } catch (e) {
        store.notify(`Error: ${e.message}`, 5);
      }

      vote.loading = false;
      votingForAddress.value = null;
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
      voteForDelegate,
      votingForAddress,
    };
  },
  components: { Navbar, Button, DataTable, Input, Section, Copy },
};
</script>

<style scoped>
.delegate-address {
  color: var(--primary-lightest);
}
</style>
