<template>
  <!-- <button @click="toggleDarkMode">Toggle Darkmode</button> -->
  <div id="app">
    <div class="sidebar">
      <router-link to="/" class="first"
        >CURRENT WALLET WITH ACTIVE TOKEN
      </router-link>
      <hr />
      <router-link to="/"><i class="fa fa-home mr-1" />DASHBOARD </router-link>
      <a @click="toWallet" :class="authenticated ? '' : 'disabled'">
        <i class="fa fa-wallet mr-1" />WALLET
      </a>
      <router-link to="/delegates">
        <i class="fa fa-poll mr-1" />VOTING
      </router-link>
      <hr />
      <router-link to="/">
        <i class="fa fa-exchange-alt mr-1" />TRANSACTIONS
      </router-link>
      <router-link to="/">
        <i class="fa fa-th-large mr-1" />BLOCKS
      </router-link>
      <router-link to="/"> <i class="fa fa-users mr-1" />ACCOUNTS </router-link>
      <router-link to="/">
        <i class="fa fa-users-cog mr-1" />DELEGATES
      </router-link>
      <hr />
      <router-link to="/">
        <i class="fa fa-signature mr-1" />SIGN MESSAGE
      </router-link>
      <router-link to="/" class="last">
        <i class="fa fa-check mr-1" />VERIFY MESSAGE
      </router-link>
    </div>
    <div class="main-content">
      <Loading v-if="!connected" />
      <router-view v-else />
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import router from './router';

import Loading from './components/parts/Loading';

export default {
  name: 'App',
  components: { Loading },
  setup() {
    const store = useStore();

    onMounted(async () => await store.commit('connect'))

    const toWallet = () => authenticated && router.push('/wallet');

    const darkMode = ref(
      window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
    const toggleDarkMode = () => (darkMode.value = !darkMode.value);
    watch(
      () => darkMode.value,
      () => document.documentElement.setAttribute('dark-theme', darkMode.value),
    );

    return {
      darkMode,
      toggleDarkMode,
      toWallet,
      connected: computed(() => store.state.connected),
      authenticated: computed(() => store.state.authenticated),
    };
  },
};
</script>

<style>
@import url('./styles/main.css');

.sidebar {
  position: fixed;
  width: 250px;
  padding: 0;
  margin: 1rem;
  border-radius: var(--border-radius);
  /* background: linear-gradient(-30deg, var(--primary), var(--primary-lightest)); */
  background-color: var(--primary);
  color: var(--white);
  text-transform: uppercase;
}

.sidebar hr {
  border: 0;
  border-top: 1px solid rgba(12, 138, 228, 0.4);
  border-width: 1px;
}

.sidebar a {
  color: var(--white);
  text-decoration: none;
  padding: 1rem;
  display: block;
  font-size: 12px;
}

a.disabled {
  color: grey;
  cursor: default;
  user-select: none;
}

a.disabled:hover {
  background-color: initial !important;
}

.sidebar a:hover {
  background-color: var(--primary-lightest);
}

.first {
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.last {
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

.main-content {
  margin-left: 285px;
  padding: 1rem 1rem 1rem 0;
  width: 100%;
  display: flex;
  box-sizing: border-box;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem 1rem;
}

#app {
  left: 100px;
  width: 100%;
}
</style>
