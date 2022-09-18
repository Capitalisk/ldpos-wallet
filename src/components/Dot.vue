<template>
  <span
    class="dot mr-2"
    :style="{
      backgroundColor: active ? 'var(--success)' : 'var(--danger)',
    }"
  />
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.dot {
  height: 6px;
  width: 6px;
  display: inline-block;
  border-radius: 50%;
}
</style>
