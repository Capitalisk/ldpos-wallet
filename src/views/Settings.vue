<template>
  <Navbar />
  <div class="flex flex-wrap flex-gap">
    <Section title="Manage networks" class="flex-12">
      Edit a network:
      {{ network }}
      <div class="flex row">
        <div class="flex-auto">
          <Select
            v-if="networks"
            v-model="network"
            select
            :options="Object.keys(networks)"
            :ref="el => (validationRefs.network = el)"
            placeholder="network"
            class="bg-primary-darkest"
            :rules="[
              val => !!val || (val && val.length <= 0) || 'Required',
              val =>
                networks.hasOwnProperty(val) ||
                'This network is not defined in the config',
            ]"
          />
        </div>
        <div v-if="network" class="flex align-center justify-center py-2">
          <i
            class="fa fa-trash-alt text-error"
            v-if="network"
            @click="deleteNetwork"
          />
        </div>
      </div>
      <template v-if="network"> {{ networks[network] }} </template>
    </Section>
  </div>
</template>

<script>
import { onMounted, reactive, ref, inject } from 'vue';

import Navbar from '../components/Navbar';
import Section from '../components/Section';
import Select from '../components/Select';

export default {
  name: 'Settings',
  components: { Navbar, Section, Select },
  setup() {
    const store = inject('store')

    const isElectron = process.env.IS_ELECTRON;

    const networks = ref(null);
    const network = ref(null);
    const validationRefs = reactive({
      network: null,
    });

    onMounted(async () => {
      if (isElectron) {
        networks.value = JSON.parse(await ipcRenderer.invoke('get-config'));
      } else {
        networks.value = JSON.parse(localStorage.getItem('config'));
      }
    });

    return {
      validationRefs,
      network,
      networks,
      deleteNetwork: async () => {
        try {
          // if (await validate()) throw new Error('Fields are invalid.');
          if (isElectron) {
            try {
              const { ipcRenderer } = await import('electron');

              delete networks.value[config.network];

              await ipcRenderer.invoke(
                'save-config',
                JSON.stringify(networks.value, null, 2),
              );

              store.notify({ message: 'Network deleted!' }, 5);
            } catch (e) {
              console.error(e);
              store.notify({ message: `Error: ${e.message}`, error: true }, 5);
            }
          } else {
            localStorage.setItem('config', JSON.stringify(networks.value));
            store.notify({ message: 'Network deleted!' }, 5);
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

<style scoped>
.login {
  max-width: 985px;
}

.input-number {
  width: 15px;
}
</style>
