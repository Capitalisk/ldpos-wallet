<template>
  <div>
    <div class="mb-1">
      Network Symbol:
    </div>
    <div class="mb-2">
      <Input
        v-model="config.networkSymbol"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div v-if="isElectron">
    <div class="mb-1">
      Type:
    </div>
    <div class="mb-2">
      <Select
        v-model="type"
        :options="['mainnet', 'testnet']"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div>
    <div class="mb-1">
      Hostname:
    </div>
    <div class="mb-2">
      <Input
        v-model="config.hostname"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div>
    <div class="mb-1">
      Port:
    </div>
    <div class="mb-2">
      <Input
        v-model="config.port"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div>
    <div class="mb-1">
      Chain Module Name:
    </div>
    <div class="mb-2">
      <Input
        v-model="config.chainModuleName"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div class="flex justify-end">
    <Button
      v-if="isElectron && showForm"
      value="Save"
      @click="addConfig"
      class="mr-2"
    />
  </div>
</template>

<script>
import { ref, reactive, inject } from 'vue';

import Input from '../Input';
import Select from '../Select';
import Button from '../Button';

// TODO: THIS IS A WIP AND NOT USED
export default {
  name: 'SettingsModal',
  components: { Input, Select, Button },
  setup() {
    const store = inject('store');

    const isElectron = ref(process.env.IS_ELECTRON || false);
    const name = ref(null);
    const config = reactive({
      networkSymbol: null,
      hostname: null,
      port: null,
      chainModuleName: null,
    });

    return {
      config,
      // TODO: Implement localStorage
      async addConfig() {
        if (!isElectron.value) throw new Error('Not electron');

        const { ipcRenderer } = await import('electron');

        try {
          const originalConfig = JSON.parse(
            await ipcRenderer.invoke('get-config'),
          );

          if (originalConfig[config.networkSymbol]) {
            if (originalConfig[config.networkSymbol][type.value]) {
              const response = await ipcRenderer.invoke('warn-overwrite');
              if (!response) throw Error('Cancelling');
              originalConfig[config.networkSymbol][type.value] = config;
            } else {
              originalConfig[config.networkSymbol][type.value] = config;
            }
          } else {
            originalConfig[config.networkSymbol] = {};
            originalConfig[config.networkSymbol][type.value] = config;
          }

          await ipcRenderer.invoke(
            'save-config',
            JSON.stringify(originalConfig, null, 2),
          );

          await getConfig();

          store.notify({ message: 'Config saved!' }, 5);
        } catch (e) {
          console.error(e);
          store.notify({ message: `Error: ${e.message}`, error: true }, 5);
        }
      },
    };
  },
};
</script>
