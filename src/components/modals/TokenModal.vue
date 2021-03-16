<template>
  <div class="flex column">
    <div>Hostname: <Input v-model="config.hostname" /></div>
    <div>Port: <Input v-model="config.port" /></div>
    <div>Network Symbol:<Input v-model="config.networkSymbol" /></div>
    <div>Chain Module Name:<Input v-model="config.chainModuleName" /></div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

import Input from '../parts/Input';
export default {
  name: 'TokenModal',
  setup() {
    const store = useStore();

    return {
      config: computed(() => store.state.config),
    };
  },
  components: { Input },
};
</script>
