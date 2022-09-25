<template>
  <Navbar back :title="title" />
  <Section v-if="hasError">
    <div class="column">
      <div class="flex justify-center">
        <h1>We could not find the record you were looking for</h1>
      </div>
      <div class="flex justify-center">
        <LottiePlayer
          :animation-data="notFound"
          background="transparent"
          speed="1"
          loop
          autoplay
        />
      </div>
    </div>
  </Section>
  <Section v-else>
    <DataTable
      v-if="dataTable && data.fn"
      order="desc"
      clickable
      :columns="columns"
      :fn="data.fn"
      :arg="data.arg"
      :title="data.arg"
      :titleLink="data.titleLink"
      :able-to-copy-title="ableToCopyTitle"
    >
      <template v-if="showDirection" v-slot:direction="slotProps">
        <i
          v-if="slotProps.row.direction === 'inbound'"
          class="fas fa-chevron-down text-success"
        />
        <i
          v-else-if="slotProps.row.direction === 'outbound'"
          class="fas fa-chevron-up text-danger"
        />
        <span v-else>
          <i class="far fa-circle mr-1 text-warning" />
          Pending...
        </span>
      </template>
      <template v-slot:id="slotProps">
        <Copy
          :value="slotProps.row.id"
          :shrink="slotProps.shrink"
          :link="`/transactions/${slotProps.row.id}`"
        />
      </template>
      <template v-slot:counterpartyAddress="slotProps">
        <Copy
          :value="slotProps.row.counterpartyAddress"
          :shrink="slotProps.shrink"
          :link="`/accounts/${slotProps.row.counterpartyAddress}`"
        />
      </template>
      <template v-slot:senderAddress="slotProps">
        <Copy
          :value="slotProps.row.senderAddress"
          :shrink="slotProps.shrink"
          :link="`/accounts/${slotProps.row.senderAddress}`"
        />
      </template>
      <template v-slot:recipientAddress="slotProps">
        <Copy
          :value="slotProps.row.recipientAddress"
          :shrink="slotProps.shrink"
          :link="`/accounts/${slotProps.row.recipientAddress}`"
        />
      </template>
    </DataTable>
    <template v-else>
      <DetailedData v-if="!loading" v-bind="$attrs" :data="data" :id="id" />
    </template>
  </Section>
</template>

<script setup>
import { inject, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { _transformMonetaryUnit, _parseDate, _isNumber } from '../utils';

import DetailedData from '../components/DetailedData';
import Section from '../components/Section';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';
import LottiePlayer from '../components/LottiePlayer';

import notFound from '../animations/not-found.json';

const props = defineProps({
  dataTable: { type: Boolean, default: false },
  ableToCopyTitle: { type: Boolean, default: true },
  title: { type: String, required: true },
  id: { type: String, default: null },
  showDirection: { type: Boolean, default: false },
});

const store = inject('store');
const route = useRoute();
const data = ref({});
const hasError = ref(false);

const getData = async () => {
  // dataTable is passed by the router
  if (props.dataTable) {
    const sw = {
      // This is relative to the route name
      AccountTransactions: () => ({
        titleLink: `/accounts/${route.params.accountId}`,
        arg: route.params.accountId,
        fn: async (accountId, fromTimestamp, offset, limit, order) => {
          const transactions = await store.client.value.getAccountTransactions(
            accountId,
            null,
            offset,
            limit,
            order,
          );
          return transactions.map(txn => {
            if (txn.recipientAddress === accountId) {
              return {
                ...txn,
                direction: 'inbound',
                counterpartyAddress: txn.senderAddress,
              };
            }
            return {
              ...txn,
              direction: 'outbound',
              counterpartyAddress: txn.recipientAddress,
            };
          });
        },
      }),
      BlockTransactions: () => ({
        titleLink: `/blocks/${route.params.blockId}`,
        arg: route.params.blockId,
        fn: async (blockId, fromTimestamp, offset, limit, order) => {
          return await store.client.value.getTransactionsFromBlock(
            blockId,
            offset,
            limit,
          );
        },
      }),
      default: () => {},
    };
    data.value = (sw[route.name] || sw.default)();
  } else {
    store.incrementLoadingCount();
    const key = Object.keys(route.params)[0];

    const sw = {
      accountId: async () =>
        await store.client.value.getAccount(route.params.accountId),
      transactionId: async () =>
        await store.client.value.getTransaction(route.params.transactionId),
      delegateId: async () =>
        await store.client.value.getDelegate(route.params.delegateId),
      blockId: async () =>
        await store.client.value.getBlock(route.params.blockId),
      default: () => {},
    };

    try {
      data.value = await (sw[key] || sw.default)();
    } catch (e) {
      console.error(e);

      store.notify(
        {
          message: 'Error: entry not found',
          error: true,
        },
        5,
      );

      hasError.value = true;
    }
    store.decrementLoadingCount();
  }
};

getData();

const columns = ref([
  {
    name: 'id',
    label: 'Id',
    field: 'id',
    sortable: false,
    active: true,
    shrinkUntilWidth: 2000,
    slot: true,
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    sortable: false,
    active: true,
    hideOnMobile: true,
  },
  {
    name: 'timestamp',
    label: 'Date',
    field: 'timestamp',
    sortable: false,
    value: val => _parseDate(val),
    active: true,
    sorted: 'desc',
    hideOnMobile: true,
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    sortable: false,
    value: val => _transformMonetaryUnit(val, store.state.config.networkSymbol),
    active: true,
    shrinkUntilWidth: 768,
  },
  {
    name: 'fee',
    label: 'Fee',
    field: 'fee',
    sortable: false,
    value: val => _transformMonetaryUnit(val, store.state.config.networkSymbol),
    active: true,
    hideOnMobile: true,
  },
]);

onMounted(() => {
  if (props.showDirection) {
    columns.value.splice(2, 0, {
      name: 'counterpartyAddress',
      label: 'Counterparty',
      field: 'counterpartyAddress',
      sortable: false,
      active: true,
      shrinkUntilWidth: 1700,
      slot: true,
      hideOnMobile: true,
    });
    columns.value.push({
      name: 'direction',
      label: '',
      sortable: false,
      active: true,
      slot: true,
    });
  } else {
    columns.value.splice(
      2,
      0,
      {
        name: 'senderAddress',
        label: 'Sender',
        sortable: false,
        active: true,
        slot: true,
        shrinkUntilWidth: 2300,
        hideOnMobile: true,
      },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        sortable: false,
        active: true,
        slot: true,
        shrinkUntilWidth: 2300,
        hideOnMobile: true,
      },
    );
  }
});

const loading = computed(() => store.state.progressBarLoading);
</script>
