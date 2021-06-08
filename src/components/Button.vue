<template>
  <a
    class="button cursor-pointer text-center"
    :class="value ? 'default' : ''"
    v-if="!routerLink"
  >
    <i
      v-if="!loading && icon"
      :class="`fa fa-${icon} ${value ? 'mr-1' : ''}`"
    />
    <i class="fa fa-circle-notch fa-spin mr-1" v-if="loading" />{{ value }}
  </a>
  <router-link class="button" :class="value ? 'default' : ''" v-else :to="href">
    <i v-if="!loading && icon" :class="`fa fa-${icon} mr-2`" />
    {{ value }}
  </router-link>
</template>

<script>
export default {
  name: 'Button',
  props: {
    value: { type: String },
    routerLink: { type: Boolean, default: false },
    href: { type: [String, Object], default: '' },
    loading: { type: Boolean, default: false },
    icon: { type: String, default: null },
  },
};
</script>

<style scoped>
a.button {
  display: block;
  border: 0;
  border-radius: var(--border-radius);
  text-decoration: none;
  background-color: var(--primary-lighter);
  color: var(--permanent-white);
  text-transform: uppercase;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 1.25px;
  text-transform: uppercase;
}

a.button.default {
  padding: var(--unit-1) var(--unit-3) !important;
}

a.button.outline {
  border: 1px solid var(--primary-lighter);
  background-color: var(--primary-lighter-bg);
  color: var(--dark);
}

a.button.outline.warning {
  border: 1px solid var(--warning);
  background-color: var(--warning);
  color: var(--permanent-dark);
}

a.button.outline.danger {
  border: 1px solid var(--danger);
  background-color: var(--danger-bg);
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
