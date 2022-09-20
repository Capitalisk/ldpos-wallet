<script setup>
import { computed, onMounted, ref } from 'vue';
import lottie from 'lottie-web';

const emit = defineEmits(['animControl']);

const props = defineProps({
  name: {
    type: String,
    default: () => 'lottie-' + Math.random(),
  },
  width: {
    type: [String, Number],
    default: () => '200px',
  },
  height: {
    type: [String, Number],
    default: () => '200px',
  },
  background: {
    type: String,
    default: 'transparent',
  },
  loop: {
    type: [Boolean, Number],
    default: () => false,
  },
  autoplay: {
    type: Boolean,
    default: () => true,
  },
  renderer: {
    type: String,
    default: () => 'svg',
  },
  path: {
    type: String,
    default: () => null,
  },
  animationData: {
    type: Object,
    default: () => null,
  },
});

const animationContainerRef = ref();

const loadAnimation = () => {
  let anim = lottie.loadAnimation({
    container: animationContainerRef.value,
    name: props.name,
    renderer: props.renderer,
    loop: props.loop,
    autoplay: props.autoplay,
    width: getSize(props.width),
    height: getSize(props.height),
    path: props.path,
    animationData: props.animationData,
  });

  emit('animControl', anim);
};

const getSize = (size) => {
  return typeof size == Number ? `${size}px` : size;
};

onMounted(loadAnimation);
</script>

<template>
  <div ref="animationContainerRef"></div>
</template>
