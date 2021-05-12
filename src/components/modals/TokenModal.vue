<template>
  <div class="flex pa-1 column">
    <div class="mb-1">
      Network:
    </div>
    <div class="mb-2">
      <Select
        v-if="networks"
        v-model="network"
        :options="Object.keys(networks)"
        :ref="el => (validationRefs.network = el)"
        placeholder="network"
        @keyup.enter="connect"
        :rules="[
          val => !!val || (val && val.length <= 0) || 'Required',
          val =>
            networks.hasOwnProperty(val) ||
            'This network is not defined in the config',
        ]"
      />
    </div>
    <div class="mb-1" v-if="isDevelopment">
      Type:
    </div>
    <div class="mb-2" v-if="isDevelopment">
      <Select
        v-model="type"
        :options="['mainnet', 'testnet']"
        :ref="el => (validationRefs.type = el)"
        placeholder="type"
        :rules="[
          val => !!val || (val && val.length <= 0) || 'Required',
          val => validateType(val),
        ]"
      />
    </div>
  </div>
  <div class="flex justify-end">
    <Button
      value="Connect"
      @click="connect"
      :class="hasErrors ? 'danger' : '' || ''"
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

    const isDevelopment = process.env.NODE_ENV === 'development';
    const isElectron = process.env.IS_ELECTRON;

    const validationRefs = reactive({
      type: null,
      network: null,
    });

    const networks = ref({});
    const network = ref(null);

    const hasErrors = ref(false);

    const getConfig = async () => {
      if (isElectron) {
        const { ipcRenderer } = await import('electron');
        const config = JSON.parse(await ipcRenderer.invoke('get-config'));
        networks.value = config;
        network.value = store.state.config.networkSymbol;
        return;
      }

      const localStorageConfig = JSON.parse(localStorage.getItem('config'));
      if (!localStorageConfig) {
        const config = await import('../../config.json');
        networks.value = config.default;
        return;
      }
      networks.value = localStorageConfig;
    };

    onMounted(async () => {
      await getConfig();
    });

    const type = ref(isDevelopment ? null : 'mainnet');

    const validate = async () => {
      let hasErrors = false;
      for (let i = 0; i < Object.values(validationRefs).length; i++) {
        const v = Object.values(validationRefs)[i];
        if (!v) continue;
        await v.validate();
        if (v.error) hasErrors = true;
      }
      return Promise.resolve(hasErrors);
    };

    return {
      isElectron,
      type,
      network,
      networks,
      validationRefs,
      hasErrors,
      connect: async () => {
        try {
          if (await validate()) throw new Error('Fields are invalid.');
          const config = networks.value[network.value][type.value];
          await store.connect({ [type.value]: config }, type.value);
          store.toggleModal();
        } catch (e) {
          store.notify({ message: `Error: ${e.message}`, error: true }, 5);
          console.error(e);
        }
      },
      validateType: val => {
        if (!network.value) return;
        return (
          (network.value &&
            networks.value[network.value] &&
            networks.value[network.value][val]) ||
          'This net is not defined in the network'
        );
      },
      isDevelopment,
    };
  },
  components: { Input, Button, Select },
};
</script>
