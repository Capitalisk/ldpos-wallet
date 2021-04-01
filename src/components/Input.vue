<template>
  <div class="flex relative align-center">
    <span class="prefix">{{ prefix }}</span>
    <input
      v-bind="$attrs"
      class=""
      :class="
        `input ${error ? 'input-error ' : ''}${prefix ? 'input-prefix ' : ''}${
          suffix ? 'input-suffix' : ''
        }`
      "
      :value="modelValue"
      @input="(e) => $emit('update:modelValue', e.target.value)"
      :placeholder="placeholder"
      :style="{
        backgroundColor: `var(--${backgroundColor})`,
        color: `var(--${color})`,
      }"
      :id="id"
    />
    <span class="suffix">{{ suffix }}</span>
  </div>
  <span v-if="error" class="text-error">{{ error }}</span>
</template>

<script>
import { ref, computed, toRefs, watch } from 'vue';

export default {
  name: 'Input',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    backgroundColor: { type: String, default: 'primary' },
    color: { type: String, default: 'dark' },
    id: { type: String, default: null },
    suffix: { type: String, default: null },
    prefix: { type: String, default: null },
    error: { type: String, default: null },
  },
};
</script>

<style scoped>
.input {
  border: 0;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  flex: 1;
}

.input:disabled {
  color: var(--disabled) !important;
}

.input-error {
  border: 1px solid var(--danger);
}

.input-prefix {
  padding-left: 2.5rem;
}

.input-suffix {
  padding-right: 2.5rem;
}

.prefix {
  position: absolute;
  left: 0.5em;
}

.suffix {
  position: absolute;
  right: 0.5rem;
}

label {
  position: relative;
  left: 15px;
}

.input::placeholder {
  color: var(--dark);
}
</style>
