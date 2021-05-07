<template>
  <Input
    :list="`${options}-${_.uid}`"
    v-model="modelValue"
    v-bind="$attrs"
    @input="e => $emit('update:modelValue', e.target.value)"
    ref="input"
  />
  <datalist :id="`${options}-${_.uid}`" :value="modelValue" class="select">
    <template v-for="option in options" :key="option">
      <option :value="option" class="option"></option>
    </template>
  </datalist>
</template>

<script>
import { ref, computed } from 'vue';

import Input from './Input';

export default {
  name: 'Select',
  props: {
    modelValue: { type: String, default: null },
    options: { type: Array, default: () => [] },
  },
  setup() {
    const input = ref(null);

    return {
      input,
      validate: computed(() => input.value && input.value.validate),
      error: computed(() => input.value && input.value.error),
    };
  },
  components: { Input },
};
</script>

<style scoped>
.select {
  border: 0;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  flex: 1;
  background-color: var(--primary);
  color: var(--dark);
  text-indent: 5px;
}
</style>
