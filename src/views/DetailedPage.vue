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
      :able-to-copy-title="ableToCopyTitle"
    >
      <template v-slot:id="slotProps">
        <Copy
          :value="slotProps.row.id"
          :shrink="slotProps.shrink"
          :link="`/transactions/${slotProps.row.id}`"
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
          v-if="slotProps.row.recipientAddress"
          :shrink="slotProps.shrink"
          :link="`/accounts/${slotProps.row.recipientAddress}`"
        />
        <span v-else>-</span>
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
            arg: route.params.accountId,
            fn: 'getAccountTransactions',
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
        shrinkUntilWidth: 2200,
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
        name: 'senderAddress',
        label: 'Sender',
        field: 'senderAddress',
        sortable: false,
        active: true,
        shrinkUntilWidth: 1900,
        slot: true,
      },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        field: 'recipientAddress',
        sortable: false,
        active: true,
        shrinkUntilWidth: 1900,
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
    ]);

    return {
      data,
      columns,
      loading: computed(() => store.state.progressbarLoading),
    };
  },
};
</script>
