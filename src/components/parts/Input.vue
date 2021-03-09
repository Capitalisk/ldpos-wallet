<template>
  <input
    class="input"
    v-model="value"
    :type="hidden ? 'password' : 'input'"
    :placeholder="placeholder"
  />
</template>

<script>
import { ref, computed, toRefs, watch } from 'vue';

export default {
  name: 'Input',
  props: {
    value: { type: String, default: '' },
    hidden: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
  },
};
</script>

<style scoped>
.input {
  background-color: var(--primary);
  border: 0;
  padding: 0.75rem;
  margin: 0.5rem;
  color: var(--white);
  border-radius: var(--border-radius);
  text-decoration: none;
}

.input::placeholder {
  color: var(--white);
}
</style>
