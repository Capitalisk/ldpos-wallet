<template>
  <a
    class="button"
    :style="
      `background-color: var(--${backgroundColor}); color: var(--${color})`
    "
    v-if="!routerLink"
    href
  >
    {{ value }}
  </a>
  <router-link class="button" v-else :to="href">{{ value }}</router-link>
</template>

<script>
export default {
  name: 'Button',
  props: {
    value: { type: String },
    color: { type: String, default: 'white' },
    backgroundColor: { type: String, default: 'primary-lighter' },
    routerLink: { type: Boolean, default: false },
    href: { type: String, default: '' },
  },
};
</script>

<style scoped>
a.button {
  cursor: pointer;
  display: block;
  background-color: var(--primary-lighter);
  border: 0;
  padding: 0.75rem 2.5rem;
  color: var(--white);
  border-radius: var(--border-radius);
  text-decoration: none;
}
</style>
