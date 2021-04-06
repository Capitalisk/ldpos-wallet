<template>
  <a
    class="button cursor-pointer text-center"
    v-if="!routerLink"
  >
    <i class="fa fa-circle-notch fa-spin mr-1" v-if="loading"></i>{{ value }}
  </a>
  <router-link
    class="button"
    v-else
    :to="href"
  >{{ value }}
  </router-link>
</template>

<script>
export default {
  name: 'Button',
  props: {
    value: { type: String },
    routerLink: { type: Boolean, default: false },
    href: { type: String, default: '' },
    loading: { type: Boolean, default: false },
  },
};
</script>

<style scoped>
a.button {
  display: block;
  border: 0;
  padding: var(--unit-1) var(--unit-5);
  border-radius: var(--border-radius);
  text-decoration: none;
  background-color: var(--primary-lighter);
  color: var(--permanent-white)
}

a.button.warning {
  background-color: var(--warning);
  color: var(--permanent-dark);
}

a.button.danger {
  background-color: var(--danger);
}

a.button.success {
  background-color: var(--success);
}
</style>
