<template>
  <div class="section" :style="{ backgroundColor, color }">
    <h4>{{ title }}</h4>

    <Loading v-if="loading" />
    <p v-else-if="!loading && error" class="error">
      <strong>Error:</strong><br />{{ error }}
    </p>
    <p v-else-if="!loading && needsAuthentication && !authenticated">
      <strong>Not signed in</strong>
    </p>
    <slot v-else></slot>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import { useClient } from '../../plugins/ldpos-client';
import Loading from './Loading';

export default {
  name: 'Section',
  props: {
    title: { type: String },
    loading: { type: Boolean },
    error: { type: String, default: null },
    needsAuthentication: { type: Boolean, default: false },
    backgroundColor: { type: String, default: 'var(--switchable-primary)' },
    color: { type: String, default: 'var(--switchable-dark)' },
  },
  components: { Loading },
  setup() {
    const store = useStore();

    return {
      authenticated: computed(() => store.state.authenticated),
    };
  },
};
</script>

<style scoped>
.section {
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  border-radius: var(--border-radius);
  width: auto;
  padding: 1rem;
}

h4 {
  margin-bottom: 0.5rem;
  color: var(--switchable-primary-lightest);
}

ul {
  list-style-type: none;
}

div {
  flex: 1;
}

.error {
  color: var(--danger);
}
</style>
