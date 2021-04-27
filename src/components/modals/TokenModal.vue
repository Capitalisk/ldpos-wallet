<template>
  <div class="flex pa-1 column">
    <template v-if="!showForm && isElectron">
      <div class="mb-1">
        Type:
      </div>
      <div class="mb-2">
        <Select
          v-model="type"
          :options="['mainnet', 'testnet']"
          placeholder="type"
          :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
        />
      </div>
      <div class="mb-1">
        Networks:
      </div>
      <div class="mb-2">
        <Select
          v-if="networks"
          v-model="network"
          :options="Object.keys(networks)"
          ref="selectRef"
          placeholder="network"
          @keyup.enter="connect"
          :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
        />
      </div>
    </template>
    <template v-else>
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
    const networks = ref({});
    const network = ref(null);
    const selectRef = ref(null);

    const getConfig = async () => {
      if (isElectron.value) {
        const { ipcRenderer } = await import('electron');
        const config = JSON.parse(await ipcRenderer.invoke('get-config'));
        networks.value = config;
        network.value = store.state.config.networkSymbol;
        return;
      }
      const config = await import('../../config.json');
    };

    onMounted(async () => {
      await getConfig();
    });

    const type = ref(
      process.env.NODE_ENV !== 'production' ? 'testnet' : 'mainnet',
    );
    const name = ref(null);
    const config = reactive({ ...store.state.config });

    return {
      isElectron,
      config,
      type,
      name,
      showForm,
      network,
      networks,
      selectRef,
      toggleForm: () => {
        showForm.value = !showForm.value;
        store.changeModalTitle(
          showForm.value
            ? 'Add a custom network to the config or connect to the network'
            : 'Connect to a network in the config',
        );
      },
      connect: async () => {
        try {
          if (isElectron.value && !showForm.value) {
            if (!selectRef.value.input.dirty)
              await selectRef.value.input.validate();

            if (selectRef.value.input.error)
              throw new Error(selectRef.value.input.error);

            if (!networks.value.hasOwnProperty(config.networkSymbol))
              throw new Error('Network not found in the config.');
            if (!networks.value[network.value].hasOwnProperty(type.value))
              throw new Error('Type is not found in the network config.');

            const c = networks.value[network.value][type.value];
            await store.connect({ [type.value]: c }, type.value);
          } else {
            await store.connect({ [type.value]: config }, type.value);
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
  components: { Input, Button, Select },
};
</script>
