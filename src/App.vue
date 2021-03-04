<template>
  <!-- <button @click="toggleDarkMode">Toggle Darkmode</button> -->
  <div id="app">
    <div class="sidebar">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/">CURRENT WALLET WITH ACTIVE TOKEN</router-link>
      <hr />
      <router-link to="/">DASHBOARD</router-link>
      <router-link to="/">WALLET</router-link>
      <router-link to="/">VOTING</router-link>
      <hr />
      <router-link to="/">TRANSACTIONS</router-link>
      <router-link to="/">BLOCKS</router-link>
      <router-link to="/">ACCOUNTS</router-link>
      <router-link to="/">DELEGATES</router-link>
      <hr />
      <router-link to="/">SIGN MESSAGE</router-link>
      <router-link to="/">VERIFY MESSAGE</router-link>
    </div>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'App',
  setup() {
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
  margin: 2rem;
  border-radius: var(--border-radius);
  background: linear-gradient(60deg, var(--primary), var(--primary-lighter));
  /* background-color: var(--primary); */
  color: var(--white);
  text-transform: uppercase;
}

.sidebar hr {
  border: 0;
  border-top: 1px solid var(--white);
  border-width: 1px;
}

.sidebar a {
  color: var(--white);
  text-decoration: none;
  padding: 1rem;
  display: block;
}

.main-content {
  margin: 2rem 2rem 2rem 300px;
  border-radius: var(--border-radius);
  background-color: var(--primary);
  color: var(--white);
  width: 100%;
  height: 3000px;
  padding: 1rem;
}

#app {
  left: 100px;
  width: 100%;
}
</style>
