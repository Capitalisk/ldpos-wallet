<template>
  <div class="section box-shadow-white-mode" :class="{ 'pa-2': !noPadding }">
    <div class="section-title">
      <h2 v-if="title" :class="{ 'ml-4': backButton }">{{ title }}</h2>
    </div>

    <Loading v-if="loading" />
    <p v-else-if="!loading && error" class="text-danger">
      <strong>Error:</strong><br />{{ error }}
    </p>
    <div v-else class="flex column justify-end">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import Loading from './Loading';

defineProps({
  title: { type: String, default: null },
  loading: { type: Boolean },
  error: { type: String, default: null },
  border: { type: String, default: null },
  backButton: { type: Boolean, default: false },
  noPadding: { type: Boolean, default: false },
});
</script>

<style scoped>
.section {
  position: relative;
  border-radius: var(--border-radius);
  background-color: var(--primary);
  color: var(--dark);
}

.bg-primary-darker {
  background-color: var(--primary-darker);
}

.section.modal {
  background-color: var(--white);
}

h2 {
  margin-bottom: var(--unit-1);
  color: var(--dark);
}

ul {
  list-style-type: none;
}
</style>
