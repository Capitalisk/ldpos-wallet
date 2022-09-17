<template>
  <NetworkForm v-model:config="config" ref="networkFormRef" />
  <div class="flex justify-end">
    <Button value="Add" @click="addConfig" class="mr-2" />
  </div>
</template>

<script>
import { ref, reactive, inject, computed, onMounted } from 'vue';

import Button from '../Button';
import NetworkForm from '../forms/NetworkForm';

export default {
  name: 'AddTokenModal',
  components: { Button, NetworkForm },
  setup() {
    const store = inject('store');

    const isElectron = process.env.IS_ELECTRON;

    const networkFormRef = ref(null);

    const config = reactive({
      networkSymbol: null,
      hostname: null,
      port: null,
      chainModuleName: null,
      secure: false,
    });

    const type = computed(() => networkFormRef.value.type);

    return {
      config,
      type,
      isElectron,
      networkFormRef,
      addConfig: async () => {
        try {
          if (await networkFormRef.value.validate())
            throw new Error('Fields are invalid.');
          if (isElectron) {
            const { ipcRenderer } = await import('electron');

            try {
              const originalConfig = JSON.parse(
                await ipcRenderer.invoke('get-config'),
              );

              if (originalConfig[config.networkSymbol]) {
                if (originalConfig[config.networkSymbol][type.value]) {
                  throw new Error(
                    `Type ${type} already exists. Remove it in the settings or give it another name.`,
                  );
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

              store.notify({ message: 'Added network!' }, 5);
              store.toggleOrBrowseModal();
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
                throw new Error(
                  `Type ${type} already exists. Remove it in the settings or give it another name.`,
                );
              } else {
                originalConfig[config.networkSymbol][type.value] = config;
              }
            } else {
              originalConfig[config.networkSymbol] = {};
              originalConfig[config.networkSymbol][type.value] = config;
            }

            localStorage.setItem('config', JSON.stringify(originalConfig));
            store.notify({ message: 'Added network!' }, 5);
            store.toggleOrBrowseModal();
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
