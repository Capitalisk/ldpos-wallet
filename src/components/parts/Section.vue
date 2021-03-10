<template>
  <div class="section">
    <h4>{{ title }}</h4>

    <Loading v-if="loading" />
    <p v-else-if="!loading && error" class="error">
      <strong>Error:</strong><br />{{ error }}
    </p>
    <p v-else-if="!loading && needsAuthentication && !walletConnected">
      <strong>Not signed in</strong>
    </p>
    <slot v-else></slot>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useClient } from '../../plugins/ldpos-client';
import Loading from './Loading';

export default {
  name: 'Section',
  props: {
    title: { type: String },
    loading: { type: Boolean },
    error: { type: String, default: null },
    needsAuthentication: { type: Boolean, default: false },
  },
  components: { Loading },
  setup() {
    const walletConnected = ref(null);
    onMounted(async () => {
      walletConnected.value = await useClient().walletConnected;
    });

    return {
      walletConnected,
    };
  },
};
</script>

<style scoped>
.section {
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  background-color: var(--primary);
  border-radius: var(--border-radius);
  width: auto;
  padding: 1rem;
}

h4 {
  margin-bottom: 0.5rem;
  color: var(--primary-lighter);
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
