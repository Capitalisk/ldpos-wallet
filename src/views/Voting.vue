<template>
  <Navbar />
  <DataTable :columns="columns" title="Voting for delegates" :fn="fn" />
</template>

<script>
import { onMounted, ref, computed, inject } from 'vue';

import Navbar from '../components/sections/Navbar';
import Button from '../components/parts/Button';
import DataTable from '../components/parts/DataTable';
import { _integerToDecimal } from '../utils';

export default {
  name: 'Home',
  components: { Navbar, Button, DataTable },
  setup() {
    const store = inject('store');

    const columns = ref([
      {
        name: 'rank',
        label: 'Rank',
        field: 'address',
        sortable: false,
        // TODO: Resolve this
        // value: (val, r) => `#${delegates.value.indexOf(r) + 1}`,
        active: true,
      },
      {
        name: 'address',
        label: 'Address',
        field: 'address',
        sortable: false,
        value: (val) => val,
        active: true,
      },
      {
        name: 'updateHeight',
        label: 'Height',
        field: 'updateHeight',
        sortable: false,
        value: (val) => new Intl.NumberFormat('be-NL').format(val),
        active: true,
      },
      {
        name: 'voteWeight',
        label: 'Vote weight',
        field: 'voteWeight',
        sortable: false,
        value: (val) => _integerToDecimal(val),
        active: true,
        shrinkable: false,
      },
      {
        name: 'voteWeight',
        label: 'Vote weight',
        field: 'voteWeight',
        sortable: false,
        value: (val) => 'Vote',
        active: store.state.authenticated,
      },
    ]);

    return {
      // vote: async () => await store.client.value.vote(),
      authenticated: computed(() => store.state.authenticated),
      columns,
      fn: async () => await store.client.value.getForgingDelegates(),
    };
  },
};
</script>

<style scoped>
.delegate-address {
  color: var(--primary-lightest);
}
</style>
