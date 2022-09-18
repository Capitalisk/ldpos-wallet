<template>
  <div class="progress">
    <div
      v-if="active"
      class="progress-bar"
      :class="{
        'progress-indeterminate': !value,
        'progress-progressive': value,
      }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  active: { type: Boolean, default: false },
  value: { type: String, default: null },
});
</script>

<style scoped>
.progress {
  background-color: transparent;
  width: 100%;
  overflow: hidden;
  border-radius: var(--border-radius);
}

.progress-bar {
  min-height: 5px;
  background-color: var(--primary-lighter);
  backface-visibility: hidden;
  perspective: 1000px;
  transform: translateZ(0);
  will-change: transform;
  transition: width 1s linear;
  border-radius: var(--border-radius);
}

.progress-indeterminate {
  width: 100%;
  animation: indeterminateAnimation 1s infinite linear;
  transform-origin: 0% 50%;
}

.progress-progressive {
  width: v-bind(value);
}

@keyframes indeterminateAnimation {
  0% {
    transform: translateX(0) scaleX(0);
  }
  40% {
    transform: translateX(0) scaleX(0.4);
  }
  100% {
    transform: translateX(100%) scaleX(0.5);
  }
}
</style>
