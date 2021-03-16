<template>
  <div class="navbar">
    <Connected />
    <span class="toggle-dark-mode mr-1">
      <span class="mr-1">Dark mode: </span>
      <Switch v-model="darkMode" />
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
  // computed: {
  //   darkMode: {
  //     get: function() {
  //       this.$store.state.darkMode;
  //     },
  //     set: function() {
  //       this.$store.commit('toggleDarkMode');
  //     },
  //   },
  // },
  components: { Button, Connected, Switch },
};
</script>

<style scoped>
.navbar {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  text-align: right;
  padding: 0 1rem;
}

.account {
  cursor: pointer;
}
.toggle-dark-mode {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
