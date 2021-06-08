<template>
  <Navbar />
  <div class="flex flex-gap mb-2">
    <Section title="Quick vote" v-if="authenticated" class="flex-3">
      <Input
        v-model="vote"
        placeholder="Wallet address"
        class="my-1 primary-darkest"
        :rules="[
          val => !!val || (val && val.length <= 0) || 'Required',
          val => (val && val.length === 44) || 'Invalid address',
          async val => await checkDelegate(val),
        ]"
        ref="voteRef"
      />
      <div class="flex justify-center">
        <Button
          value="Vote"
          @click="voteForDelegate"
          :loading="loading"
          :class="voteRef && voteRef.error ? 'danger' : ''"
        />
      </div>
    </Section>
  </div>
  <DataTable
    :columns="columns"
    :title="title"
    fn="getDelegatesByVoteWeight"
    clickable
    prefix="delegates"
  >
    <template v-slot:vote="slotProps">
      <Button
        :value="votes.includes(slotProps.row.address) ? 'Unvote' : 'Vote'"
        @click.prevent.stop
        @click="
          voteForDelegate(
            slotProps.row.address,
            votes.includes(slotProps.row.address),
          )
        "
        :loading="votingForAddress === slotProps.row.address"
        :class="votes.includes(slotProps.row.address) ? 'warning' : ''"
      />
    </template>
    <template v-slot:address="slotProps">
      <Copy :value="slotProps.row.address" :shrink="slotProps.shrink" />
    </template>
    <template v-slot:forging="slotProps">
      <Dot
        :active="
          slotProps.row.updateHeight ===
            Math.max(...slotProps.rows.map(e => e.updateHeight))
        "
      />
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

import { _transformMonetaryUnit } from '../utils';
import Dot from '../components/Dot';

export default {
  name: 'Home',
  setup() {
    const store = inject('store');

    const vote = ref(null);
    const voteRef = ref(null);
    const loading = ref(false);
    const votingForAddress = ref(null);
    const maxBlockHeight = ref(null);
    const authenticated = computed(() => store.state.authenticated);
    const votes = ref([]);

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
        slot: true,
      },
      {
        name: 'voteWeight',
        label: 'Vote weight',
        field: 'voteWeight',
        sortable: false,
        value: val => _transformMonetaryUnit(val),
        active: true,
        shrinkable: false,
      },
      {
        name: 'forging',
        label: 'Forging',
        field: 'forging',
        active: true,
        slot: true,
      },
      {
        name: 'vote',
        label: 'Vote for delegate',
        sortable: false,
        value: val => 'Vote',
        active: authenticated,
        slot: true,
      },
    ]);

    onMounted(async () => {
      maxBlockHeight.value = await store.client.value.getMaxBlockHeight();

      if (store.state.authenticated) {
        votes.value = await store.client.value.getAccountVotes(
          await store.client.value.getWalletAddress(),
        );
      }
    });

    const voteForDelegate = async (wallet, unvote) => {
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
            type: unvote ? 'unvote' : 'vote',
            delegateAddress: wallet,
            fee: unvote ? minTransactionFees.unvote : minTransactionFees.vote,
            timestamp: Date.now(),
            message: unvote
              ? 'Unvote for delegate via ldpos-wallet'
              : 'Vote for delegate via ldpos-wallet',
          });
        } else {
          debugger;
          voteTxn = await store.client.value.prepareTransaction({
            type: 'vote',
            delegateAddress: vote.value,
            fee: minTransactionFees.vote,
            timestamp: Date.now(),
            message: 'Vote for delegate via ldpos-wallet',
          });
        }

        await store.client.value.postTransaction(voteTxn);
        store.notify(
          {
            message: `You have voted for ${vote.value ||
              wallet}. Take in account that this needs to be processed in the chain. This can take a while.`,
          },
          5,
        );
      } catch (e) {
        store.notify({ message: `Error: ${e.message}`, error: true }, 5);
      }

      loading.value = false;
      votingForAddress.value = null;
      vote.value = null;
    };

    return {
      title: computed(() =>
        store.state.authenticated ? 'Voting for delegates' : 'Delegates',
      ),
      columns,
      authenticated,
      vote,
      loading,
      voteRef,
      voteForDelegate,
      votingForAddress,
      maxBlockHeight,
      votes,
      checkDelegate: async val => {
        try {
          await store.client.value.getDelegate(val);
        } catch (e) {
          return 'Not a delegate';
        }
      },
    };
  },
  components: { Navbar, Button, DataTable, Input, Section, Copy, Dot },
};
</script>

<style scoped>
.delegate-address {
  color: var(--primary-lightest);
}
</style>
