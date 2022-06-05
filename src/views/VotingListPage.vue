<template>
  <Navbar back :title="title" />
  <Section>
    <DataTable
      order="desc"
      :prefix="urlPrefix"
      clickable
      :columns="columns"
      :fn="data.fn"
      :arg="data.arg"
      :title="data.arg"
      :titleLink="data.titleLink"
      :able-to-copy-title="ableToCopyTitle"
      :paginate="paginate"
    >
      <template v-slot:address="slotProps">
        <Copy
          :value="slotProps.row.address"
          :link="`/accounts/${slotProps.row.address}`"
        />
      </template>
    </DataTable>
  </Section>
</template>

<script>
import { inject, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import DetailedData from '../components/DetailedData';
import Section from '../components/Section';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Copy from '../components/Copy';

export default {
  name: 'VotingListPage',
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
    const data = ref({});

    const getData = async () => {
      store.mutateProgressbarLoading(true);
      const sw = {
        AccountVotes: () => ({
          titleLink: `/accounts/${route.params.accountId}`,
          arg: route.params.accountId,
          fn: async (accountId) => {
            const votes = await store.client.value.getAccountVotes(accountId);
            return votes.map(address => ({ address }));
          },
        }),
        DelegateVoters: () => ({
          titleLink: `/accounts/${route.params.delegateId}`,
          arg: route.params.delegateId,
          fn: async (delegateId, fromTimestamp, offset, limit, order) => {
            const voters = await store.client.value.getDelegateVoters(delegateId, offset, limit, order);
            return voters.map(address => ({ address }));
          },
        }),
        default: () => {},
      };
      data.value = (sw[route.name] || sw.default)();

      store.mutateProgressbarLoading(false);
    };

    getData();

    let isVoterList = !!route.params.delegateId;

    const columns = ref([
      {
        name: 'address',
        label: isVoterList ? 'Voter address' : 'Delegate address',
        field: 'address',
        sortable: false,
        active: true,
        slot: true,
      }
    ]);

    return {
      paginate: isVoterList,
      urlPrefix: isVoterList ? 'accounts' : 'delegates',
      data,
      columns,
      loading: computed(() => store.state.progressbarLoading),
    };
  },
};
</script>