<template>
  <div class="flex flex-gap pa-1 column">
    <template v-if="!showForm && isElectron">
      Networks:
      <Select
        v-model="network"
        :options="networks && networks.map(n => n.name)"
        :extra-options="['mainnet', 'testnet']"
        ref="selectRef"
        @keyup.enter="connect"
        :rules="[
          val => !!val || (val && val.length <= 0) || 'Required',
          val =>
            (val && val.split(' ').length === 2) ||
            'Should consist of two words. E.g. capitalisk mainnet',
        ]"
      />
    </template>
    <template v-else>
      <div v-if="isElectron">
        Name:
        <Input v-model="name" />
      </div>
      <div v-if="isElectron">
        Type:
        <Select v-model="type" :options="['mainnet', 'testnet']" />
      </div>
      <div>
        Hostname:
        <Input
          v-model="config.hostname"
          :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
        />
      </div>
      <div>
        Port:
        <Input
          v-model="config.port"
          :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
        />
      </div>
      <div>
        Network Symbol:
        <Input
          v-model="config.networkSymbol"
          :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
        />
      </div>
      <div>
        Chain Module Name:
        <Input
          v-model="config.chainModuleName"
          :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
        />
      </div>
    </template>
  </div>
  <div class="flex justify-center">
    <div @click="toggleForm" v-if="isElectron" class="cursor-pointer">
      <template v-if="showForm">
        <i class="fas fa-chevron-up"></i> Hide form
      </template>
      <template v-else>
        <i class="fas fa-chevron-down"></i> Add network
      </template>
    </div>
  </div>
  <div class="flex justify-end">
    <Button
      v-if="isElectron && showForm"
      value="Save"
      @click="addConfig"
      class="mr-2"
    />
    <Button
      value="Connect"
      @click="connect"
      :class="
        selectRef && selectRef.input && selectRef.input.error
          ? 'danger'
          : '' || ''
      "
    />
  </div>
</template>

<script>
import { ref, reactive, computed, inject, onUpdated, onMounted } from 'vue';

import { CONFIG_FILE_PATH, CONFIG_PATH } from '../../constants';

import Input from '../Input';
import Button from '../Button';
import Select from '../Select';

export default {
  name: 'TOKEN_MODAL',
  setup() {
    const store = inject('store');

    const isElectron = ref(process.env.IS_ELECTRON || false);

    const showForm = ref(false);
    const networks = ref(null);
    const network = ref(null);
    const selectRef = ref(null);

    const getConfig = async () => {
      if (isElectron.value) {
        const { ipcRenderer } = await import('electron');
        const config = JSON.parse(await ipcRenderer.invoke('get-config'));
        networks.value = config;
        return;
      }
      const config = await import('../../config.json');
    };

    onMounted(async () => {
      await getConfig();
    });

    onUpdated(async () => {
      await getConfig();
    });

    const type = ref(
      process.env.NODE_ENV !== 'production' ? 'testnet' : 'mainnet',
    );
    const name = ref('Capitalisk');
    const config = reactive({
      hostname: store.state.config.hostname,
      port: store.state.config.port,
      networkSymbol: store.state.config.networkSymbol,
      chainModuleName: store.state.config.chainModuleName,
    });

    return {
      isElectron,
      config,
      type,
      name,
      showForm,
      network,
      networks,
      selectRef,
      toggleForm: () => (showForm.value = !showForm.value),
      connect: async () => {
        try {
          if (isElectron.value && !showForm.value) {
            await selectRef.value.input.validate();
            if (selectRef.value.input.error)
              throw new Error(selectRef.value.input.error);

            const arr = network.value.split(' ');

            const i = networks.value.findIndex(n => n.name === arr[0]);
            if (i === -1) throw new Error('Network not found in the config.');

            const c = networks.value[i][arr[1]];
            await store.connect(c);
          } else {
            await store.connect(config);
          }
          store.toggleModal();
        } catch (e) {
          store.notify({ message: `Error: ${e.message}`, error: true }, 5);
          console.error(e);
        }
      },
      async addConfig() {
        if (!isElectron.value) throw new Error('Not electron');

        const { ipcRenderer } = await import('electron');

        try {
          const originalConfig = JSON.parse(
            await ipcRenderer.invoke('get-config'),
          );

          const send = async () => {
            await ipcRenderer.invoke(
              'save-config',
              JSON.stringify(originalConfig, null, 2),
            );

            networks.value = originalConfig;

            store.notify({ message: 'Config saved!' }, 5);
          };

          for (let i = 0; i < originalConfig.length; i++) {
            const c = originalConfig[i];
            if (c.name === name.value.toLowerCase()) {
              // In the case testnet exists but mainnet doesn't or the other way around
              if (!c[type]) {
                originalConfig[i][type.value] = config;

                await send();

                return;
              }

              store.notify(
                { message: 'Name is already being used', error: true },
                5,
              );
              return;
            }
            if (JSON.stringify(c[type.value]) === JSON.stringify(config)) {
              store.notify(
                { message: 'Config is already been found', error: true },
                5,
              );
              return;
            }
          }

          originalConfig.push({
            name: name.value.toLowerCase(),
            [type.value]: config,
          });

          await send();
        } catch (e) {
          console.error(e);
          store.notify({ message: `Error: ${e.message}`, error: true }, 5);
        }
      },
    };
  },
  components: { Input, Button, Select },
};
</script>
