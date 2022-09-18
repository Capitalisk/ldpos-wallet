<template>
  <DetailedData :data="data" :prepend-fn="prependFn" />
</template>

<script setup>
import { computed, inject } from 'vue';

import DetailedData from '../DetailedData';

const store = inject('store');

const data = computed(() => store.state.modal.data);
const prependFn = store.state.modal.prependFn;
</script>
