<template>
  <div v-if="active" class="popup">
    <Section>
      <slot />
    </Section>
  </div>
</template>

<script setup>
import Section from './Section';

defineProps({
  active: { type: Boolean, default: false },
});
</script>

<style scoped>
.popup {
  position: absolute;
  transform: translateY(var(--unit-2));
  right: 0;
  min-width: 300px;
}
</style>
