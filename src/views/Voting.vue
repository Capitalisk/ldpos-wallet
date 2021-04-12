<template>
  <Navbar />
  <div class="flex flex-gap mb-2">
    <Section title="Quick vote" v-if="authenticated" class="flex-3">
      <Input
        v-model="vote"
        placeholder="Wallet address"
        class="my-1 primary-darkest"
        :rules="[
          val => !!val || val && val.length <= 0 || 'Required',
          val => (val && val.length === 44) || 'Invalid address',
          async val => await checkDelegate(val),
        ]"
        ref="voteRef"
      />
      <div class="flex justify-center">
        <Button
          value="Vote"
          @click="() => voteForDelegate()"
          :loading="loading"
          :class="voteRef && voteRef.error ? 'danger' : ''"
        />
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

    const vote = ref(null);
    const voteRef = ref(null);
    const loading = ref(false);
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
      if (!wallet) {
        loading.value = true;
        await voteRef.value.validate();
      }

      if (voteRef.value.error) {
        loading.value = false;
        return;
      } else votingForAddress.value = wallet;

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
          voteTxn = await store.client.value.prepareTransaction({
            type: 'vote',
            delegateAddress: vote.data,
            fee: minTransactionFees.vote,
            timestamp: Date.now(),
            message: '',
          });
        }

        await store.client.value.postTransaction(voteTxn);
        store.notify({ message: `You have voted for ${vote.data}` }, 5);
      } catch (e) {
        store.notify({ message: `Error: ${e.message}`, error: true }, 5);
      }

      loading.value = false;
      votingForAddress.value = null;
    };

    return {
      title: computed(() =>
        store.state.authenticated ? 'Voting for delegates' : 'Delegates',
      ),
      columns,
      fn: async () => await store.client.value.getForgingDelegates(),
      authenticated: computed(() => store.state.authenticated),
      vote,
      loading,
      voteRef,
      voteForDelegate,
      votingForAddress,
      checkDelegate: async val => {
        try {
          await store.client.value.getDelegate(val);
        } catch (e) {
          return 'Not a delegate';
        }
      },
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
