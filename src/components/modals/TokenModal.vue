<template>
  <div class="flex pa-1 column">
    <div class="mb-1">Network</div>
    <div class="mb-2">
      <Select
        v-if="networks"
        v-model="network"
        :options="Object.keys(networks)"
        placeholder="network"
        select
        no-empty-option
        @keyup.enter="connect"
      />
    </div>
    <div class="mb-1" v-if="isDevelopment && network">Type</div>
    <div class="mb-2" v-if="isDevelopment && network">
      <Select
        v-model="type"
        :options="Object.keys(networks[network])"
        select
        no-empty-option
        placeholder="type"
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

    const networks = ref({});
    const network = ref(null);

    const hasErrors = ref(false);

    const filterNetworks = networks => {
      if (isDevelopment) {
        return networks;
      } else {
        const keys = Object.keys(networks);
        const newNetworks = [];
        for (let i = 0; i < keys.length; i++) {
          const network = keys[i];
          if (!networks[network].mainnet) delete networks[network];
        }
        return networks;
      }
    };

    const getConfig = async () => {
      network.value = store.state.config.networkSymbol;
      if (isElectron) {
        const { ipcRenderer } = await import('electron');
        const config = JSON.parse(await ipcRenderer.invoke('get-config'));
        networks.value = filterNetworks(config);
        return;
      }

      const localStorageConfig = JSON.parse(localStorage.getItem('config'));
      if (!localStorageConfig) {
        const config = await import('../../config.json');
        networks.value = filterNetworks(config.default);
        return;
      }
      networks.value = filterNetworks(localStorageConfig);
    };

    onMounted(async () => {
      await getConfig();
    });

    const type = ref(isDevelopment ? 'testnet' : 'mainnet');

    return {
      isElectron,
      type,
      network,
      networks,
      hasErrors,
      connect: async () => {
        try {
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
