<template>
  <input
    class="input"
    :value="value"
    @input="(e) => $emit('input', value)"
    :type="hidden ? 'password' : 'input'"
    :placeholder="placeholder"
    :style="{
      backgroundColor: `var(--${backgroundColor})`,
      color: `var(--${color})`,
    }"
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
    backgroundColor: { type: String, default: 'primary-darkest' },
    color: { type: String, default: 'white' },
  },
};
</script>

<style scoped>
.input {
  border: 0;
  padding: 0.75rem;
  margin: 0.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
}

.input::placeholder {
  color: var(--white);
}
</style>
