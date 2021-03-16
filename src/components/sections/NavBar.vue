<template>
  <div class="navbar flex justify-end align-center text-right">
    <Connected />
    <span class="flex justify-center align-center mr-1">
      <span class="mr-1">Dark mode: </span>
      <Switch v-model="darkMode" id="darkmode-switch" />
    </span>
    <Button v-if="authenticated" value="Sign out" @click="signout" />
    <Button value="Sign in" router-link href="/login" v-else />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

import Button from '../parts/Button';
import Connected from '../parts/Connected.vue';
import Switch from '../parts/Switch.vue';

export default {
  name: 'NavBar',
  setup() {
    const store = useStore();

    const signout = async () => store.commit('deauthenticate');

    return {
      authenticated: computed(() => store.state.authenticated),
      signout,
      // darkMode: computed(() => store.state.darkMode)
      darkMode: computed({
        get: () => store.state.darkMode,
        set: (val) => store.commit('toggleDarkMode'),
      }),
    };
  },
  components: { Button, Connected, Switch },
};
</script>

<style scoped>
.navbar {
  width: 100%;
  align-items: center;
  padding: 0 1rem;
}
</style>
