<template>
  <div v-if="active" class="popup">
    <Section
      backgroundColor="primary-darkest"
      color="dark"
      border="primary-darker"
    >
      <slot />
    </Section>
  </div>
</template>

<script>
import Section from './Section';

export default {
  name: 'Popup',
  props: {
    active: { type: Boolean, default: false },
  },
  setup() {},
  components: { Section },
};
</script>

<style scoped>
.popup {
  position: absolute;
  transform: translateY(1rem);
  right: 0;
  min-width: 300px;
}
</style>
