<template>
  <div class="navbar flex justify-end align-center text-right">
    <h1 class="mr-auto">{{ $route.name }}</h1>
    <div v-show="searchActive" style="width: 70%;">
      <Input placeholder="Search" ref="searchRef" @blur="searchActive = false">
        <template v-slot:suffix>
          <i class="fas fa-search cursor-pointer" @click="search" />
        </template>
      </Input>
    </div>
    <template v-if="!searchActive">
      <Connected />
      <span class="flex justify-center align-center mr-2">
        <Switch v-model="darkMode" id="darkmode-switch" />
      </span>
      <Button
        v-if="authenticated"
        value="Sign out"
        @click="signout"
        class="ml-1 mr-2"
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
        class="ml-1 mr-2"
      />
      <Button
        v-if="!searchActive"
        icon="search"
        @click="activateSearch"
        class="pa-1 outline"
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
    const searchRef = ref(null);

    return {
      searchActive,
      searchRef,
      activateSearch: () => {
        searchActive.value = true;
        setTimeout(() => searchRef.value.focus(), 100);
      },
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
