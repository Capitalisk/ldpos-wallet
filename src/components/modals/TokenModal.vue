<template>
  <div class="flex flex-gap pa-1 column">
    <div>
      Hostname:
      <Input
        v-model="config.hostname"
        :rules="[val => !val || val.length > 0 || 'Required']"
      />
    </div>
    <div>
      Port:
      <Input
        v-model="config.port"
        :rules="[val => !val || val.length > 0 || 'Required']"
      />
    </div>
    <div>
      Network Symbol:
      <Input
        v-model="config.networkSymbol"
        :rules="[val => !val || val.length > 0 || 'Required']"
      />
    </div>
    <div>
      Chain Module Name:
      <Input
        v-model="config.chainModuleName"
        :rules="[val => !val || val.length > 0 || 'Required']"
      />
    </div>
  </div>
  <div class="flex justify-end">
    <Button value="Connect" @click="connect" />
  </div>
</template>

<script>
import { computed, inject } from 'vue';

import Input from '../Input';
import Button from '../Button';

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
