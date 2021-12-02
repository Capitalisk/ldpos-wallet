<template>
  <Navbar back />
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
    />
    <template v-else>
      <DetailedData v-if="!loading" v-bind="$attrs" :data="data" />
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

export default {
  name: 'DetailedPage',
  components: { Section, DetailedData, Navbar, DataTable },
  props: {
    dataTable: { type: Boolean, default: false },
    ableToCopyTitle: { type: Boolean, default: false },
    title: { type: String, default: null },
  },
  setup({ dataTable }) {
    const store = inject('store');
    const route = useRoute();
    const router = useRouter();
    const data = ref({});

    const getData = async () => {
      store.mutateProgressbarLoading(true);
      // dataTable is passed by the router
      if (dataTable) {
        const sw = {
          // This is relative to the route name
          'account transaction details': () => ({
            arg: route.params.account,
            fn: 'getAccountTransactions',
          }),
          default: () => {},
        };

        data.value = (sw[route.name] || sw.default)();
      } else {
        const key = Object.keys(route.params)[0];

        const sw = {
          account: async () =>
            await store.client.value.getAccount(route.params.account),
          transaction: async () =>
            await store.client.value.getTransaction(route.params.transaction),
          delegate: async () =>
            await store.client.value.getDelegate(route.params.delegate),
          block: async () =>
            await store.client.value.getBlock(route.params.block),
          default: () => {},
        };

        data.value = await (sw[key] || sw.default)();
      }
      store.mutateProgressbarLoading(false);
    };

    watchEffect(async () => route.path && (await getData()));

    const columns = ref([
      {
        name: 'type',
        label: 'type',
        field: 'type',
        sortable: false,
        active: true,
      },
      // {
      //   name: 'senderAddress',
      //   label: 'Sender',
      //   field: 'senderAddress',
      //   sortable: false,
      //   active: true,
      // },
      {
        name: 'recipientAddress',
        label: 'Recipient',
        field: 'recipientAddress',
        sortable: false,
        active: true,
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
