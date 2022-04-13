<template>
  <Navbar back :title="title" />
  <Section>
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
      <template v-slot:direction="slotProps">
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
    </DataTable>
    <template v-else>
      <DetailedData v-if="!loading" v-bind="$attrs" :data="data" :id="id" />
    </template>
  </Section>
</template>

<script>
import { inject, ref, watch, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { _transformMonetaryUnit, _parseDate } from '../utils';

import DetailedData from '../components/DetailedData';
import Section from '../components/Section';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';

export default {
  name: 'DetailedPage',
  components: { Section, DetailedData, Navbar, DataTable, Copy },
  props: {
    dataTable: { type: Boolean, default: false },
    ableToCopyTitle: { type: Boolean, default: true },
    title: { type: String, required: true },
    id: { type: String, default: null },
  },
  setup(props) {
    const store = inject('store');
    const route = useRoute();
    const router = useRouter();
    const data = ref({});

    const getData = async () => {
      store.mutateProgressbarLoading(true);
      // dataTable is passed by the router
      if (props.dataTable) {
        const sw = {
          // This is relative to the route name
          'AccountsTransactions': () => ({
            titleLink: `/accounts/${route.params.accountId}`,
            arg: route.params.accountId,
            fn: async (accountId, fromTimestamp, offset, limit, order) => {
              const transactions = await store.client.value.getAccountTransactions(accountId, null, offset, limit, order);
              return transactions.map((txn) => {
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
          default: () => {},
        };
        data.value = (sw[route.name] || sw.default)();
      } else {
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

        data.value = await (sw[key] || sw.default)();
      }
      store.mutateProgressbarLoading(false);
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
      },
      {
        name: 'counterpartyAddress',
        label: 'Counterparty',
        field: 'counterpartyAddress',
        sortable: false,
        active: true,
        shrinkUntilWidth: 1700,
        slot: true,
      },
      {
        name: 'timestamp',
        label: 'Date',
        field: 'timestamp',
        sortable: false,
        value: val => _parseDate(val),
        active: true,
        sorted: 'desc',
      },
      {
        name: 'amount',
        label: 'Amount',
        field: 'amount',
        sortable: false,
        value: val =>
          _transformMonetaryUnit(val, store.state.config.networkSymbol),
        active: true,
      },
      {
        name: 'fee',
        label: 'Fee',
        field: 'fee',
        sortable: false,
        value: val =>
          _transformMonetaryUnit(val, store.state.config.networkSymbol),
        active: true,
      },
      {
        name: 'direction',
        label: 'Direction',
        sortable: false,
        active: true,
        slot: true,
      },
    ]);

    return {
      data,
      columns,
      loading: computed(() => store.state.progressbarLoading),
    };
  },
};
</script>
