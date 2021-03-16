<template>
  <input
    class="input"
    :value="modelValue"
    @input="(e) => $emit('update:modelValue', e.target.value)"
    :type="hidden ? 'password' : 'input'"
    :placeholder="placeholder"
    :style="{
      backgroundColor: `var(--${backgroundColor})`,
      color: `var(--${color})`,
    }"
    :id="id"
  />
</template>

<script>
import { ref, computed, toRefs, watch } from 'vue';

export default {
  name: 'Input',
  props: {
    modelValue: { type: String, default: '' },
    hidden: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    backgroundColor: { type: String, default: 'primary' },
    color: { type: String, default: 'dark' },
    id: { type: String, default: '' },
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
  color: var(--dark);
}
</style>
