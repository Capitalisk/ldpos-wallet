<template>
  <Navbar />
  <DataTable :rows="delegates" :columns="columns" title="Delegates" />
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';

import AccountDetails from '../components/sections/AccountDetails';
import Navbar from '../components/sections/Navbar';
import Button from '../components/parts/Button';
import DataTable from '../components/parts/DataTable';

export default {
  name: 'Home',
  components: { AccountDetails, Navbar, Button, DataTable },
  setup() {
    const store = useStore();

    const delegates = ref(null);

    onMounted(
      async () =>
        (delegates.value = await store.state.client.getForgingDelegates()),
    );

    const columns = ref([
      {
        name: 'rank',
        label: 'Rank',
        field: 'address',
        sortable: false,
        value: (val, r) => delegates.value.indexOf(r),
      },
      {
        name: 'address',
        label: 'Address',
        field: 'address',
        sortable: false,
        value: (val) => val,
        class: 'token-address'
      },
      {
        name: 'updateHeight',
        label: 'Height',
        field: 'updateHeight',
        sortable: false,
        value: (val) => val,
      },
      {
        name: 'voteWeight',
        label: 'Vote weight',
        field: 'voteWeight',
        sortable: false,
        value: (val) => val,
      },
    ]);

    return {
      delegates,
      // vote: async () => await store.state.client.vote(),
      authenticated: computed(() => store.state.authenticated),
      columns,
    };
  },
};
</script>

<style scoped>
.delegate-address {
  color: var(--primary-lightest);
}
</style>
