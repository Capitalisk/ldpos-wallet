<template>
  <span class="connection">
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
        store.state.config && store.state.config.port === '7001'
          ? 'Testnet'
          : 'Mainnet',
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
