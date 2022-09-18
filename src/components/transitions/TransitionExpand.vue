<template>
  <transition
    name="expand"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';

const emit = defineEmits(['hide', 'enter']);

const props = defineProps({
  width: { type: String, default: 'auto' },
  direction: { type: String, default: 'width' },
});

const enter = element => {
  emit('enter');
  const height = getComputedStyle(element).height;

  element.style.height = height;
  element.style.position = 'absolute';
  element.style.visibility = 'hidden';
  element.style[props.direction] = props.width;

  const value = getComputedStyle(element)[props.direction];

  element.style[props.direction] = null;
  element.style.position = null;
  element.style.visibility = null;
  element.style[props.direction] = 0;

  // Force repaint to make sure the
  // animation is triggered correctly.
  getComputedStyle(element)[props.direction];

  // Trigger the animation.
  // We use `requestAnimationFrame` because we need
  // to make sure the browser has finished
  // painting after setting the `width`
  // to `0` in the line above.
  requestAnimationFrame(() => {
    element.style[props.direction] = value;
  });
};

const afterEnter = element => {
  element.style[props.direction] = props.width;
};

const leave = element => {
  const value = getComputedStyle(element)[props.direction];

  element.style[props.direction] = value;

  // Force repaint to make sure the
  // animation is triggered correctly.
  getComputedStyle(element)[props.direction];

  requestAnimationFrame(() => {
    element.style[props.direction] = 0;
  });

  // Relative to the transition time
  setTimeout(() => emit('hide'), 200);
};
</script>

<style scoped>
* {
  will-change: width;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>

<style>
.expand-enter-active,
.expand-leave-active {
  transition: width 0.2s ease-in-out;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  width: 0;
}
</style>
