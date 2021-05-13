<template>
  <div class="section pa-2">
    <h2>{{ title }}</h2>

    <Loading v-if="loading" />
    <p v-else-if="!loading && error" class="text-error">
      <strong>Error:</strong><br />{{ error }}
    </p>
    <div v-else class="flex column justify-end custom-height">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { computed, inject, onMounted, ref } from 'vue';

import Loading from './Loading';

export default {
  name: 'Section',
  props: {
    title: { type: String },
    loading: { type: Boolean },
    error: { type: String, default: null },
    border: { type: String, default: null },
  },
  components: { Loading },
  setup() {
    const store = inject('store');

    return {
      authenticated: computed(() => store.state.authenticated),
    };
  },
};
</script>

<style scoped>
.section {
  position: relative;
  border-radius: var(--border-radius);
  padding: var(--unit-2);
  background-color: var(--primary);
  color: var(--dark);
  min-height: 150px;
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

@media screen and (max-width: 768px) {
  .section {
    width: 100%;
  }
}
</style>
