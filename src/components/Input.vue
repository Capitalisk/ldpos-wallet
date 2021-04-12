<template>
  <div class="flex relative align-center">
    <span class="prefix">{{ prefix }}</span>
    <input
      v-bind="$attrs"
      class="input"
      :class="
        `input ${error || error ? 'input-error ' : ''}${
          prefix ? 'input-prefix ' : ''
        }${suffix ? 'input-suffix' : ''}`
      "
      :value="modelValue"
      @input="e => $emit('update:modelValue', e.target.value)"
      :placeholder="placeholder"
      :id="id"
      @blur="validate"
      @ended="validate"
      @focus="reset"
    />
    <span class="suffix">{{ suffix }}</span>
  </div>
  <span v-if="dirty && error" class="text-error ml-1">
    {{ error }}
  </span>
</template>

<script>
import { ref, computed, toRefs, watch } from 'vue';

export default {
  name: 'Input',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    id: { type: String, default: null },
    suffix: { type: String, default: null },
    prefix: { type: String, default: null },
    error: { type: String, default: null },
    rules: { type: Array, default: null },
  },
  setup(props) {
    const error = ref(props.error);
    const dirty = ref(props.error ? true : false);

    return {
      error,
      dirty,
      reset: () => (error.value = null),
      validate: async () => {
        if (!props.rules || !props.rules.length) return;

        dirty.value = true;

        for (let i = 0; i < props.rules.length; i++) {
          const rule = props.rules[i];
          const e = await rule(props.modelValue);
          if (typeof e !== 'string') continue;

          const hasError = e.length > 0;

          if (hasError) {
            error.value = e;
            break;
          }
        }
      },
    };
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
  background-color: var(--primary);
  color: var(--dark);
}

.input.danger {
  background-color: var(--danger);
  color: var(--permanent-white);
}

.input.primary-darkest {
  background-color: var(--primary-darkest);
  color: var(--permanent-white);
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
