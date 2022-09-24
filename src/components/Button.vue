<template>
  <a
    class="button cursor-pointer text-center"
    :class="{ default: value && !small, 'no-caps': noCaps }"
    v-if="!routerLink"
  >
    <i
      v-if="!loading && icon"
      :class="`fa fa-${icon} ${value ? 'mr-1' : ''}`"
    />
    <i class="fa fa-circle-notch fa-spin mr-1" v-if="loading" />
    {{ value }}
    <span v-if="shortcut" :class="{ code }" class="ml-1">{{ shortcut }}</span>
  </a>
  <router-link
    class="button cursor-pointer text-center"
    :class="{ default: value && !small, 'no-caps': noCaps }"
    v-else
    :to="href"
  >
    <i v-if="!loading && icon" :class="`fa fa-${icon} mr-2`" />
    {{ value }}
    <span v-if="shortcut" :class="{ code }" class="ml-1">{{ shortcut }}</span>
  </router-link>
</template>

<script setup>
defineProps({
  value: { type: [String, Number] },
  routerLink: { type: Boolean, default: false },
  href: { type: [String, Object], default: '' },
  loading: { type: Boolean, default: false },
  icon: { type: String, default: null },
  width: { type: String, default: 'auto' },
  height: { type: String, default: 'auto' },
  small: { type: Boolean, default: false },
  noCaps: { type: Boolean, default: false },
  code: { type: Boolean, default: false },
  shortcut: { type: String, default: null },
});
</script>

<style scoped>
a.button {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;
  border-radius: var(--border-radius);
  text-decoration: none;
  background-color: var(--primary-lighter);
  color: var(--permanent-white);
  text-transform: uppercase;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 1.25px;
  text-transform: uppercase;
  width: v-bind(width);
  height: v-bind(height);
}

a.button.no-caps {
  text-transform: initial;
  font-weight: 400;
}
a.button span.code {
  display: block;
  border: 1px solid var(--primary-darkest);
  border-radius: 4px;
  padding-left: 6px;
  padding-right: 6px;
  min-width: 0;
  width: auto;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  font-weight: 500;
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

a.button.outline.disabled {
  border: 1px solid var(--disabled);
  background-color: var(--primary-lighter-bg);
  color: var(--dark);
  cursor: not-allowed;
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
