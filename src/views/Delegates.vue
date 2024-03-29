<template>
  <Navbar :title="title" />
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
    fn="getDelegatesByVoteWeight"
    clickable
    prefix="delegates"
    :prependFn="getVotes"
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
      <Copy
        :value="slotProps.row.address"
        :shrink="slotProps.shrink"
        :link="`/accounts/${slotProps.row.address}`"
      />
    </template>
    <template v-slot:forging="slotProps">
      <Dot
        :active="recentForgers && recentForgers.has(slotProps.row.address)"
      />
    </template>
  </DataTable>
</template>

<script setup>
import { onMounted, ref, computed, inject, reactive } from 'vue';

import Navbar from '../components/Navbar';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Section from '../components/Section';
import Input from '../components/Input';
import Copy from '../components/Copy';

import { _transformMonetaryUnit } from '../utils';
import Dot from '../components/Dot';

const DELEGATE_ACTIVITY_ROUNDS = 3;

defineProps({
  title: { type: String, required: true },
});
const store = inject('store');

const vote = ref(null);
const voteRef = ref(null);
const loading = ref(false);
const votingForAddress = ref(null);
const maxBlockHeight = ref(null);
const authenticated = computed(() => store.state.authenticated);
const votes = ref([]);
const delegateCount = ref(null);
const recentForgers = ref(null);
const slotCount = computed(
  () => delegateCount.value * DELEGATE_ACTIVITY_ROUNDS,
);

const columns = ref([
  {
    name: 'rank',
    label: 'Rank',
    field: 'rank',
    sortable: false,
    value: (val, r, rows, offset) => `#${rows.indexOf(r) + 1 + offset}`,
    active: true,
    hideOnMobile: authenticated,
  },
  {
    name: 'address',
    label: 'Address',
    field: 'address',
    sortable: false,
    value: val => val,
    active: true,
    slot: true,
    shrinkUntilWidth: 992,
  },
  {
    name: 'voteWeight',
    label: 'Vote weight',
    field: 'voteWeight',
    sortable: false,
    value: val => _transformMonetaryUnit(val),
    active: true,
    hideOnMobile: true,
    shrinkUntilWidth: 1400,
  },
  {
    name: 'forging',
    label: 'Forging',
    field: 'forging',
    active: true,
    slot: true,
    hideOnMobile: true,
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
    try {
      votes.value = await store.client.value.getAccountVotes(
        await store.client.value.getWalletAddress(),
      );
    } catch (e) {
      console.error(e);
      votes.value = [];
    }
  }

  delegateCount.value = (await store.client.value.getForgingDelegates()).length;

  const latestBlocks = await store.client.value.getBlocksBetweenHeights(
    Math.max(0, maxBlockHeight.value - slotCount.value),
    maxBlockHeight.value,
    slotCount.value,
  );

  recentForgers.value = new Set(latestBlocks.map(block => block.forgerAddress));
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

const checkDelegate = async val => {
  try {
    await store.client.value.getDelegate(val);
  } catch (e) {
    return 'Not a delegate';
  }
};

const getVotes = async account => {
  const votes = await store.client.value.getAccountVotes(account.address);

  return { key: 'votes', value: votes };
};
</script>

<style scoped>
.delegate-address {
  color: var(--primary-lighter);
}
</style>
