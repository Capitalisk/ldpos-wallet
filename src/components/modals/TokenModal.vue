<template>
  <div class="flex flex-gap pa-1 column">
    <div>Hostname: <Input v-model="config.hostname" /></div>
    <div>Port: <Input v-model="config.port" /></div>
    <div>Network Symbol:<Input v-model="config.networkSymbol" /></div>
    <div>Chain Module Name:<Input v-model="config.chainModuleName" /></div>
  </div>
  <div class="flex justify-end">
    <Button value="Connect" @click="connect" />
  </div>
</template>

<script>
import { computed, inject } from 'vue';

import Input from '../parts/Input';
import Button from '../parts/Button';

export default {
  name: 'TOKEN_MODAL',
  setup() {
    const store = inject('store');

    return {
      config: computed(() => store.state.config),
      connect: async () => {
        await store.connect(store.state.config);
        store.toggleModal();
      },
    };
  },
  components: { Input, Button },
};
</script>
