<template>
  <div class="navbar flex justify-end align-center text-right">
    <h1 class="mr-auto">{{ $route.name }}</h1>
    <Connected />
    <span class="flex justify-center align-center mr-2">
      <Switch v-model="darkMode" id="darkmode-switch" />
    </span>
    <Button
      v-if="authenticated"
      value="Sign out"
      @click="signout"
      class="ml-1"
    />
    <Button
      value="Sign in"
      router-link
      :href="isElectron ? '/' : '/login'"
      v-else-if="
        (($router.currentRoute.value.path !== '/' && isElectron) ||
          (!isElectron && $router.currentRoute.value.path !== '/login')) &&
          !authenticated
      "
      class="ml-1"
    />
  </div>
</template>

<script>
import { computed, inject } from 'vue';

import Button from './Button';
import Connected from './Connected';
import Switch from './Switch';
import Input from './Input'

export default {
  name: 'Navbar',
  setup() {
    const store = inject('store');

    return {
      authenticated: computed(() => store.state.authenticated),
      signout: async () => store.deauthenticate(),
      darkMode: computed({
        get: () => store.state.darkMode,
        set: val => store.toggleDarkMode(),
      }),
      isElectron: process.env.IS_ELECTRON,
    };
  },
  components: { Button, Connected, Switch },
};
</script>

<style scoped>
.navbar {
  padding: var(--unit-2) var(--unit-2);
  min-height: 36px;
}

@media screen and (max-width: 768px) {
  .navbar {
    display: none;
  }
}
</style>
