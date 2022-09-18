<template>
  <Navbar :title="title" />
  <div class="flex flex-wrap flex-gap">
    <Section class="flex-12">
      Network
      <div class="flex row my-1">
        <div class="flex-auto">
          <Select
            v-if="networks"
            v-model="network"
            select
            :options="Object.keys(networks)"
            placeholder="network"
            class="bg-primary-darkest"
          />
        </div>
        <div v-if="network" class="flex align-center justify-center py-2">
          <i
            class="fa fa-trash-alt text-danger ml-2"
            v-if="network"
            @click="deleteNetwork"
          />
        </div>
      </div>
      <template v-if="network && networks[network]">
        Type
        <div class="flex row my-1">
          <div class="flex-auto">
            <Select
              v-if="network"
              v-model="type"
              select
              no-empty-option
              :options="Object.keys(networks[network])"
              placeholder="network"
              class="bg-primary-darkest"
            />
          </div>
          <div v-if="network" class="flex align-center justify-center py-2">
            <i
              class="fa fa-trash-alt text-danger ml-2"
              v-if="network"
              @click="deleteType"
            />
          </div>
        </div>
      </template>
      <template v-if="type">
        <NetworkForm
          class="bg-primary-darkest"
          v-model:config="networks[network][type]"
          edit
        />
        <Button value="Edit" @click="editNetwork" class="mr-2" />
      </template>
    </Section>
  </div>
</template>

<script setup>
import { onMounted, ref, inject, watch } from 'vue';

import Navbar from '../components/Navbar';
import Section from '../components/Section';
import Select from '../components/Select';
import Button from '../components/Button';
import NetworkForm from '../components/forms/NetworkForm';

import config from '../config';

defineProps({
  title: { type: String, required: true },
});
const store = inject('store');

const isElectron = process.env.IS_ELECTRON;

const networks = ref(null);
const network = ref(null);
const type = ref(null);

watch(
  () => network.value,
  n => {
    if (!n) {
      network.value = null;
      type.value = null;
    }
  },
);

onMounted(async () => {
  if (isElectron) {
    const { ipcRenderer } = await import('electron');

    networks.value = JSON.parse(await ipcRenderer.invoke('get-config'));
  } else {
    networks.value = JSON.parse(localStorage.getItem('config'));
  }

  if (!networks.value) networks.value = config;
});

const deleteNetwork = async () => {
  try {
    // if (await validate()) throw new Error('Fields are invalid.');
    delete networks.value[network.value];
    if (isElectron) {
      const { ipcRenderer } = await import('electron');

      await ipcRenderer.invoke(
        'save-config',
        JSON.stringify(networks.value, null, 2),
      );

      store.notify({ message: 'Network deleted!' }, 5);
      network.value = null;
    } else {
      localStorage.setItem('config', JSON.stringify(networks.value));
      store.notify({ message: 'Network deleted!' }, 5);
      network.value = null;
    }
  } catch (e) {
    store.notify({ message: `Error: ${e.message}`, error: true }, 5);
    console.error(e);
  }
};

const deleteType = async () => {
  try {
    delete networks.value[network.value][type.value];
    if (isElectron) {
      const { ipcRenderer } = await import('electron');

      await ipcRenderer.invoke(
        'save-config',
        JSON.stringify(networks.value, null, 2),
      );

      store.notify({ message: 'Network deleted!' }, 5);
      type.value = null;
    } else {
      localStorage.setItem('config', JSON.stringify(networks.value));
      store.notify({ message: 'Network deleted!' }, 5);
      type.value = null;
    }
  } catch (e) {
    store.notify({ message: `Error: ${e.message}`, error: true }, 5);
    console.error(e);
  }
};

const editNetwork = async () => {
  if (isElectron) {
    const { ipcRenderer } = await import('electron');

    await ipcRenderer.invoke(
      'save-config',
      JSON.stringify(networks.value, null, 2),
    );

    store.notify({ message: 'Network edited!' }, 5);
    type.value = null;
  } else {
    localStorage.setItem('config', JSON.stringify(networks.value));
    store.notify({ message: 'Network edited!' }, 5);
  }
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
