<template>
  <div class="navbar flex justify-end align-center text-right">
    <h1 class="mr-auto">{{ $route.name }}</h1>
    <template v-if="searchActive">
      <Input placeholder="Search">
        <template v-slot:prefix><i class="fas fa-search"/></template>
        <template v-slot:suffix>
          <i
            class="fas fa-times cursor-pointer"
            @click="searchActive = false"
          />
        </template>
      </Input>
    </template>
    <template v-else>
      <Connected />
      <span class="flex justify-center align-center mr-2">
        <Switch v-model="darkMode" id="darkmode-switch" />
      </span>
      <Button
        v-if="!searchActive"
        icon="search"
        @click="searchActive = true"
        class="pa-1 outline"
      />
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
    </template>
  </div>
</template>

<script>
import { computed, inject, ref } from 'vue';

import Button from './Button';
import Connected from './Connected';
import Switch from './Switch';
import Input from './Input';

export default {
  name: 'Navbar',
  setup() {
    const store = inject('store');

    const searchActive = ref(false);

    return {
      searchActive,
      authenticated: computed(() => store.state.authenticated),
      signout: async () => store.deauthenticate(),
      darkMode: computed({
        get: () => store.state.darkMode,
        set: val => store.toggleDarkMode(),
      }),
      isElectron: process.env.IS_ELECTRON,
    };
  },
  components: { Button, Connected, Switch, Input },
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
