<template>
  <select
    v-if="select"
    class="select"
    v-bind="$attrs"
    :value="modelValue"
    @change="
      e =>
        $emit(
          'update:modelValue',
          e.target.options[e.target.selectedIndex].label,
        )
    "
  >
    <option v-if="!noEmptyOption" />
    <option v-for="(option, i) in options" :key="i" :value="option">
      {{ option }}
    </option>
  </select>
  <template v-else>
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
</template>

<script setup>
import { ref, computed } from 'vue';

import Input from './Input';

defineProps({
  modelValue: { type: String, default: null },
  options: { type: Array, default: () => [] },
  select: { type: Boolean, default: false },
  noEmptyOption: { type: Boolean, default: false },
});

const input = ref(null);

const validate = computed(() => input.value && input.value.validate);
const error = computed(() => input.value && input.value.error);

defineExpose({ error, validate });
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
  box-sizing: border-box;
  width: 100%;
}
</style>
