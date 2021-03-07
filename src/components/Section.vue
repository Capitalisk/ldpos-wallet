<template>
  <div :class="`section ${gap ? 'flex-gap' : ''}`">
    <h4>{{ title }}</h4>
    <slot v-if="!loading"></slot>
    <Loading v-else />
    <p v-if="!loading && error" class="error">
      <strong>Error:</strong><br />{{ error }}
    </p>
    <!-- <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
import Loading from './Loading';

export default {
  name: 'Section',
  props: {
    title: { type: String },
    loading: { type: Boolean },
    gap: { type: Boolean, default: false },
    error: { type: String, default: null },
  },
  components: { Loading },
};
</script>

<style scoped>
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
