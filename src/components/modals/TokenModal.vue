<template>
  <div class="flex flex-gap pa-1 column">
    {{ isElectron }}
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
    <!-- <Button value="Save" @click="saveConfig" /> -->
    <Button value="Connect" @click="connect" />
  </div>
</template>

<script>
import { ref, reactive, computed, inject } from 'vue';

import Input from '../Input';
import Button from '../Button';

export default {
  name: 'TOKEN_MODAL',
  setup() {
    const store = inject('store');

    // const isElectron = ref(process.env.IS_ELECTRON || false);

    const config = reactive({
      hostname: store.state.config.hostname,
      port: store.state.config.port,
      networkSymbol: store.state.config.networkSymbol,
      chainModuleName: store.state.config.chainModuleName,
    });

    return {
      // isElectron,
      config,
      connect: async () => {
        try {
          // TODO: Handle validation and keyup events
          await store.connect(config);
          store.toggleModal();
        } catch (e) {
          store.notify({ message: `Error: ${e.message}`, error: true }, 5);
          console.error(e);
        }
      },
      // saveConfig: config => store.saveConfig(config),
    };
  },
  components: { Input, Button },
};
</script>
