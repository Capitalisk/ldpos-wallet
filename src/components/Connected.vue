<template>
  <span class="connection">
    {{ connected ? `Connected: ${network}` : 'Disconnected' }}
  </span>
  <span
    class="dot"
    :style="{
      backgroundColor: connected ? 'var(--success)' : 'var(--danger)',
    }"
  />
</template>

<script>
import { computed, inject } from 'vue';

export default {
  name: 'Connected',
  setup() {
    const store = inject('store');

    return {
      connected: computed(() => store.state.connected),
      network: computed(() =>
        store.state.config && store.state.config.port === '7001' ? 'Testnet' : 'Mainnet',
      ),
    };
  },
};
</script>

<style scoped>
.dot {
  height: 6px;
  width: 6px;
  display: inline-block;
  border-radius: 50%;
  margin-right: auto;
}

.connection {
  padding: 0 var(--unit-1);
}
</style>
