<template>
  <Navbar />
  <Section>
    <DataTable
      v-if="dataTable && data.fn"
      order="desc"
      clickable
      :columns="columns"
      :fn="data.fn"
      :arg="data.arg"
    />
    <DetailedData v-else v-bind="$attrs" :data="data" />
  </Section>
</template>

<script>
import { inject, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { _transformMonetaryUnit, _parseDate } from '../utils';

import DetailedData from '../components/DetailedData.vue';
import Section from '../components/Section.vue';
import Navbar from '../components/Navbar.vue';
import DataTable from '../components/DataTable.vue';

export default {
  name: 'DetailedPage',
  components: { Section, DetailedData, Navbar, DataTable },
  props: {
    dataTable: {
      type: Boolean,
      default: false,
    },
  },
  setup({ dataTable }) {
    const store = inject('store');
    const route = useRoute();
    const router = useRouter();
    const data = ref({});

    onMounted(async () => {
      if (!dataTable) {
        const key = Object.keys(route.params)[0];

        const sw = {
          wallet: async () =>
            await store.client.value.getAccount(route.params.wallet),
          transaction: async () =>
            await store.client.value.getTransaction(route.params.transaction),
          delegate: async () =>
            await store.client.value.getDelegate(route.params.delegate),
          default: () => {},
        };

        data.value = await (sw[key] || sw.default)();
      } else {
        const sw = {
          'Wallet transaction details': () => ({
            arg: route.params.wallet,
            fn: 'getAccountTransactions',
          }),
          default: () => {},
        };

        data.value = await (sw[route.name] || sw.default)();
      }
    });

    const columns = ref([
      { name: 'type', label: 'type', field: 'type', sortable: false, active: true },
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
        sortable: true,
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
    };
  },
};
</script>
