<template>
  <div
    class="section pa-2"
    :style="{
      backgroundColor: `var(--${backgroundColor})`,
      color: `var(--${color})`,
      border: border ? `1px solid var(--${border})` : '',
    }"
  >
    <h4>{{ title }}</h4>

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
import { computed, inject, onMounted, ref } from "vue";

import Loading from "./Loading";

export default {
  name: "Section",
  props: {
    title: { type: String },
    loading: { type: Boolean },
    error: { type: String, default: null },
    backgroundColor: { type: String, default: "primary" },
    color: { type: String, default: "dark" },
    border: { type: String, default: null },
  },
  components: { Loading },
  setup() {
    const store = inject("store");

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
}

h4 {
  margin-bottom: var(--unit-1);
  color: var(--primary-darker);
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
