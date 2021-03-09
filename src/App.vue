<template>
  <!-- <button @click="toggleDarkMode">Toggle Darkmode</button> -->
  <div id="app">
    <div class="sidebar">
      <router-link to="/" class="first"
        >CURRENT WALLET WITH ACTIVE TOKEN</router-link
      >
      <hr />
      <router-link to="/">DASHBOARD</router-link>
      <router-link to="/about">WALLET</router-link>
      <router-link to="/">VOTING</router-link>
      <hr />
      <router-link to="/">TRANSACTIONS</router-link>
      <router-link to="/">BLOCKS</router-link>
      <router-link to="/">ACCOUNTS</router-link>
      <router-link to="/">DELEGATES</router-link>
      <hr />
      <router-link to="/">SIGN MESSAGE</router-link>
      <router-link to="/" class="last">VERIFY MESSAGE</router-link>
    </div>
    <div class="main-content">
      <Loading v-if="!clientConnected" />
      <router-view v-else />
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch, inject } from 'vue';

import Loading from './components/parts/Loading';
import { connect } from './plugins/ldpos-client';

export default {
  name: 'App',
  components: { Loading },
  setup() {
    const config = {
      hostname: '34.227.22.98',
      port: '7001',
      passphrase:
        'oval moral close neck table curtain focus chronic april add clown differ',
      networkSymbol: 'clsk',
      chainModuleName: 'capitalisk_chain',
    };

    const clientConnected = ref(false);

    onMounted(async () => {
      const { connected } = await connect(config);
      clientConnected.value = connected;
    });

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
      clientConnected,
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
  /* background: linear-gradient(-30deg, var(--primary), var(--primary-lighter)); */
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
.sidebar a:hover {
  background-color: var(--primary-lighter);
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
