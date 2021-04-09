<template>
  <Input list="options" :value="modelValue" />
  <datalist
    id="options"
    v-bind="$attrs"
    :value="modelValue"
    @input="e => $emit('update:modelValue', e.target.value)"
    class="select"
  >
    <template v-for="(option, i) in options" :key="i">
      <option :value="option" class="option">
        {{ option }}
      </option>
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
