<template>
  <label class="switch">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', !modelValue)"
    />
    <span class="slider cursor-pointer" :id="id"></span>
  </label>
</template>

<script>
import { getCurrentInstance } from 'vue';

export default {
  name: 'Switch',
  props: {
    modelValue: { type: Boolean, default: false },
    id: { type: String, default: '' },
  },
};
</script>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 30px;
  height: 17px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  border-radius: 17px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--switch-background);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  border-radius: 50%;
  position: absolute;
  content: '';
  height: 13px;
  width: 13px;
  left: 3px;
  bottom: 2px;
  background-color: var(--dark);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--primary-lighter);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-lighter);
}

input:checked + .slider:before {
  -webkit-transform: translateX(11px);
  -ms-transform: translateX(11px);
  transform: translateX(11px);
  background-color: var(--permanent-white);
}
</style>
