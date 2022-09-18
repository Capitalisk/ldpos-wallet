<template>
  <Navbar :title="title" />
  {{ queryParams }}
</template>

<script setup>
import { _transformMonetaryUnit } from '../utils';

import Navbar from '../components/Navbar';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

defineProps({
  title: { type: String, required: true },
});

const route = useRoute();

const queryParams = computed(() => route.query);
</script>

<style scoped></style>
