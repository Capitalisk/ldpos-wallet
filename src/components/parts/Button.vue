<template>
  <a
    class="button cursor-pointer"
    :style="{
      backgroundColor: `var(--switchable-${backgroundColor})`,
      color: `var(--switchable-${color})`,
      ...style,
    }"
    v-if="!routerLink"
  >
    <i class="fa fa-circle-o-notch fa-spin mr-1" v-if="loading"></i>{{ value }}
  </a>
  <router-link class="button" v-else :to="href">{{ value }}</router-link>
</template>

<script>
export default {
  name: 'Button',
  props: {
    value: { type: String },
    color: { type: String, default: 'white' },
    backgroundColor: { type: String, default: 'primary-lightest' },
    routerLink: { type: Boolean, default: false },
    href: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    style: { type: String, default: '' },
  },
};
</script>

<style scoped>
a.button {
  display: block;
  background-color: var(--switchable-primary-lightest);
  border: 0;
  padding: 0.5rem 2.5rem;
  color: var(--switchable-dark);
  border-radius: var(--border-radius);
  text-decoration: none;
}
</style>
