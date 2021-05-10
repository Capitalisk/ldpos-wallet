<template>
  <div>
    <div class="mb-1">
      Network Symbol:
    </div>
    <div class="mb-2">
      <Input
        v-model="config.networkSymbol"
        :ref="el => (validationRefs.networkSymbol = el)"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div>
    <div class="mb-1">
      Type:
    </div>
    <div class="mb-2">
      <Select
        v-model="type"
        :options="['mainnet', 'testnet']"
        :ref="el => (validationRefs.type = el)"
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
        :ref="el => (validationRefs.hostname = el)"
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
        :ref="el => (validationRefs.port = el)"
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
        :ref="el => (validationRefs.chainModuleName = el)"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div class="flex justify-end">
    <Button value="Save" @click="addConfig" class="mr-2" />
  </div>
</template>

<script>
import { ref, reactive, inject } from 'vue';

import Input from '../Input';
import Select from '../Select';
import Button from '../Button';

// TODO: THIS IS A WIP AND NOT USED
export default {
  name: 'AddTokenModal',
  components: { Input, Select, Button },
  setup() {
    const store = inject('store');

    const validationRefs = reactive({
      networkSymbol: null,
      type: null,
      hostname: null,
      port: null,
      chainModuleName: null,
    });

    const isElectron = ref(process.env.IS_ELECTRON || false);
    const type = ref(null);
    const name = ref(null);
    const config = reactive({
      networkSymbol: null,
      hostname: null,
      port: null,
      chainModuleName: null,
    });

    const validate = async () => {
      let hasErrors = false;
      for (let i = 0; i < Object.values(validationRefs).length; i++) {
        const v = Object.values(validationRefs)[i];
        await v.validate();
        if (v.error) hasErrors = true;
      }
      return Promise.resolve(hasErrors);
    };

    return {
      config,
      type,
      validationRefs,
      isElectron,
      // TODO: Implement localStorage
      addConfig: async () => {
        try {
          if (await validate()) throw new Error('Fields are invalid.');
          if (isElectron.value) {
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

              store.notify({ message: 'Config saved!' }, 5);
            } catch (e) {
              console.error(e);
              store.notify({ message: `Error: ${e.message}`, error: true }, 5);
            }
          } else {
            let originalConfig = JSON.parse(localStorage.getItem('config'));

            if (!originalConfig) {
              originalConfig = await import('../../config.json');
              originalConfig = originalConfig.default;
            }

            if (originalConfig[config.networkSymbol]) {
              if (originalConfig[config.networkSymbol][type.value]) {
                console.log('overwriting');
                originalConfig[config.networkSymbol][type.value] = config;
              } else {
                originalConfig[config.networkSymbol][type.value] = config;
              }
            } else {
              originalConfig[config.networkSymbol] = {};
              originalConfig[config.networkSymbol][type.value] = config;
            }

            localStorage.setItem('config', JSON.stringify(originalConfig));
          }
        } catch (e) {
          store.notify({ message: `Error: ${e.message}`, error: true }, 5);
          console.error(e);
        }
      },
    };
  },
};
</script>
