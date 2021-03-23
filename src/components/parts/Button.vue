<template>
  <a
    class="button cursor-pointer text-center"
    :style="{
      backgroundColor: `var(--${backgroundColor})`,
      color: `var(--${color})`,
      ...style,
    }"
    v-if="!routerLink"
  >
    <i class="fa fa-circle-notch fa-spin mr-1" v-if="loading"></i>{{ value }}
  </a>
  <router-link
    class="button"
    v-else
    :to="href"
    :style="{
      backgroundColor: `var(--${backgroundColor})`,
      color: `var(--${color})`,
      ...style,
    }"
    >{{ value }}</router-link
  >
</template>

<script>
export default {
  name: 'Button',
  props: {
    value: { type: String },
    color: { type: String, default: 'permanent-white' },
    backgroundColor: { type: String, default: 'primary-lighter' },
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
  border: 0;
  padding: 0.5rem 2.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
}
</style>
