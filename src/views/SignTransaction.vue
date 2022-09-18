<template>
  <Navbar :title="title" />
  <Section>
    <DetailedData :data="queryParams" />
    <Button value="Sign transaction" @click="sign" :loading="loading" />
  </Section>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed, inject, ref } from 'vue';

import { _transformMonetaryUnit } from '../utils';

import Navbar from '../components/Navbar';
import Section from '../components/Section';
import Button from '../components/Button';
import DetailedData from '../components/DetailedData';

defineProps({
  title: { type: String, required: true },
});

const route = useRoute();
const store = inject('store');

const queryParams = computed(() => ({
  ...route.query,
  timestamp: Date.now(),
}));

const loading = ref(false);

const sign = async () => {
  try {
    loading.value = true;

    console.log(queryParams.value);

    const preparedTxn = await store.client.value.prepareTransaction(
      queryParams.value,
    );

    await store.client.value.postTransaction(preparedTxn);

    store.notify(
      { message: `Transaction sent to ${queryParams.value.recipientAddress}` },
      5,
    );
  } catch (e) {
    store.notify({ message: `Error: ${e.message}`, error: true }, 5);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped></style>
