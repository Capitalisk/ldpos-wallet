<template>
  <Navbar />
  <DataTable
    :rows="delegates"
    :columns="columns"
    title="Voting for delegates"
    :loading="loading"
  />
</template>

<script>
import { onMounted, ref, computed, inject } from 'vue';

import AccountDetails from '../components/sections/AccountDetails';
import Navbar from '../components/sections/Navbar';
import Button from '../components/parts/Button';
import DataTable from '../components/parts/DataTable';
import { _integerToDecimal } from '../utils';

export default {
  name: 'Home',
  components: { AccountDetails, Navbar, Button, DataTable },
  setup() {
    const store = inject('store');
    const loading = ref(false);

    const delegates = ref(null);

    onMounted(
      async () =>
        (delegates.value = await store.client.value.getForgingDelegates()),
    );

    const columns = ref([
      {
        name: 'rank',
        label: 'Rank',
        field: 'address',
        sortable: false,
        value: (val, r) => `#${delegates.value.indexOf(r) + 1}`,
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
      delegates,
      // vote: async () => await store.client.value.vote(),
      authenticated: computed(() => store.state.authenticated),
      columns,
      loading,
    };
  },
};
</script>

<style scoped>
.delegate-address {
  color: var(--primary-lightest);
}
</style>
