<template>
  <div class="flex relative align-center">
    <span class="prefix">{{ prefix }}<slot name="prefix"/></span>
    <input
      v-bind="$attrs"
      class="input"
      :class="
        `input ${error || error ? 'input-error ' : ''}${
          prefix || $slots.prefix ? 'input-prefix ' : ''
        }${suffix || $slots.suffix ? 'input-suffix' : ''}`
      "
      :value="modelValue"
      @input="e => $emit('update:modelValue', e.target.value)"
      :placeholder="placeholder"
      :id="id"
      @blur="validate"
      @ended="validate"
      @focus="reset"
      ref="input"
      data-gramm="false"
    />
    <span class="suffix">{{ suffix }}<slot name="suffix"/></span>
  </div>
  <span v-if="dirty && error && !hideValidation" class="text-danger ml-1">
    {{ error }}
  </span>
</template>

<script>
import { ref, computed, toRefs, watch } from 'vue';

export default {
  name: 'Input',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: { type: String, default: '' },
    id: { type: String, default: null },
    suffix: { type: String, default: null },
    prefix: { type: [String, Number], default: null },
    error: { type: String, default: null },
    rules: { type: Array, default: null },
    hideValidation: { type: Boolean, default: false },
  },
  setup(props) {
    const error = ref(props.error);
    const dirty = ref(props.error ? true : false);
    const input = ref(null);

    return {
      error,
      dirty,
      input,
      focus: () => input.value.focus(),
      reset: () => (error.value = null),
      validate: async () => {
        if (!props.rules || !props.rules.length) return;

        dirty.value = true;

        for (let i = 0; i < props.rules.length; i++) {
          const rule = props.rules[i];
          const e = await rule(props.modelValue);

          if (typeof e !== 'string') {
            error.value = null;
            continue;
          }

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
  border: none;
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
  color: var(--dark);
}

.input.primary-darker {
  background-color: var(--primary-darker);
  color: var(--dark);
}

.input:disabled {
  color: var(--disabled) !important;
}

.input:focus {
  outline: none;
  border: none;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 1px var(--dark);
}

.input-error {
  outline: none;
  border: none;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 1px var(--danger);
}

.input-prefix {
  padding-left: 2.5rem;
}

.input-suffix {
  padding-right: 2.5rem;
}

.prefix {
  position: absolute;
  left: 1em;
}

.suffix {
  position: absolute;
  right: 1rem;
}

label {
  position: relative;
  left: 15px;
}

.input::placeholder {
  color: var(--dark);
}
</style>
