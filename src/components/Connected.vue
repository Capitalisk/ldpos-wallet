<template>
  <div class="mobile-hidden">
    <span class="connection">
      {{ connected ? `Connected: ${network}` : 'Disconnected' }}
    </span>
    <Dot :active="connected" />
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';

import Dot from './Dot';

const store = inject('store');

const connected = computed(() => store.state.connected);
const network = computed(() =>
  store.state.selectedNetwork
    ? `${store.state.selectedNetwork
        .charAt(0)
        .toUpperCase()}${store.state.selectedNetwork.slice(1)}`
    : 'Mainnet',
);
</script>

<style scoped>
.connection {
  padding: 0 var(--unit-1);
}
</style>
