<template>
  {{ modelValue }}
  <Input
    list="options"
    v-model="modelValue"
    v-bind="$attrs"
    @input="e => $emit('update:modelValue', e.target.value)"
  />
  <datalist id="options" :value="modelValue" class="select">
    <template v-for="option in options" :key="option">
      <template v-if="extraOptions">
        <option
          v-for="e in extraOptions"
          :key="e"
          :value="`${option} ${e}`"
          class="option"
        >
          {{ e }}
        </option>
      </template>
      <template v-else>
        <option :value="option" class="option"></option>
      </template>
    </template>
  </datalist>
</template>

<script>
import Input from './Input';

export default {
  name: 'Select',
  props: {
    modelValue: { type: String, default: null },
    options: { type: Array, default: () => [] },
    extraOptions: { type: Array, default: null },
  },
  setup() {},
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
