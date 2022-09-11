<template>
  <span class="connection mobile-hidden">
    {{ connected ? `Connected: ${network}` : 'Disconnected' }}
  </span>
  <Dot :active="connected" />
</template>

<script>
import { computed, inject } from 'vue';

import Dot from './Dot';

export default {
  name: 'Connected',
  setup() {
    const store = inject('store');

    return {
      connected: computed(() => store.state.connected),
      network: computed(() =>
        store.state.selectedNetwork ?
        `${store.state.selectedNetwork.charAt(0).toUpperCase()}${store.state.selectedNetwork.slice(1)}` :
        'Mainnet',
      ),
    };
  },
  components: { Dot },
};
</script>

<style scoped>
.connection {
  padding: 0 var(--unit-1);
}
</style>
