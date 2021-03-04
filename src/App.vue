<template>
  <button @click="toggleDarkMode">Toggle Darkmode</button>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view />
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

    const toggleDarkMode = () => {
      console.log('hit');
      darkMode.value = !darkMode.value;
      console.log(darkMode)
    };

    watch(
      () => darkMode.value,
      () => {
        console.log(darkMode.value)
        document.documentElement.setAttribute('dark-theme', darkMode.value)
      }
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
#app {
  text-align: center;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
