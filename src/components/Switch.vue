<template>
  <label class="switch" :class="{ dense }">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', !modelValue)"
      :class="{ dense }"
    />
    <span
      class="slider cursor-pointer"
      :class="{ dense }"
      :white-mode="!modelValue"
      v-bind="$attrs"
    ></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  dense: { type: Boolean, default: false },
});
</script>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.switch.dense {
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
  z-index: 1;
}

.slider:before {
  border-radius: 50%;
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 2px;
  bottom: 2px;
  background-color: var(--primary-lighter);
  -webkit-transition: 0.4s;
  transition: 0.4s;
  z-index: 1;
}

.slider.dense:before {
  height: 13px;
  width: 13px;
  left: 3px;
}

.slider.darkmode::after {
  content: url(../assets/sun.svg);
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-40%);
}

.slider.darkmode[white-mode='true']::after {
  content: url(../assets/moon.svg);
  right: 8px;
  top: 50%;
  transform: translateY(-40%);
}

input:checked + .slider {
  background-color: var(--primary-darker);
}

input:checked + .slider:before {
  -webkit-transform: translateX(30px);
  -ms-transform: translateX(30px);
  transform: translateX(30px);
  background-color: var(--primary-lighter);
}

input:checked + .slider.dense:before {
  -webkit-transform: translateX(11px);
  -ms-transform: translateX(11px);
  transform: translateX(11px);
  background-color: var(--permanent-white);
}
</style>
