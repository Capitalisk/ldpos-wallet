<template>
  <div class="navbar">
    <span class="connection"
      >{{ connected ? `Connected: ${network}` : 'Disconnected' }}
    </span>
    <span
      class="dot"
      :style="{
        backgroundColor: connected ? 'var(--success)' : 'var(--danger)',
      }"
    />
    <span class="toggle-dark-mode mr-1">
      <Button @click="toggleDarkMode" :value="darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'" />
    </span>
    <Button v-if="authenticated" value="Sign out" @click="signout" />
    <Button value="Sign in" router-link href="/login" v-else />
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import Button from '../parts/Button';

export default {
  name: 'NavBar',
  setup() {
    const store = useStore();

    const signout = async () => store.commit('deauthenticate');

    return {
      connected: computed(() => store.state.connected),
      authenticated: computed(() => store.state.authenticated),
      signout,
      network: computed(() =>
        store.state.client.options.port === '7001' ? 'Testnet' : 'Mainnet',
      ),
      toggleDarkMode: () => store.commit('toggleDarkMode'),
      darkMode: computed(() => store.state.darkMode)
    };
  },
  components: { Button },
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

.connection {
  padding: 0 0.5rem;
}

.dot {
  height: 6px;
  width: 6px;
  display: inline-block;
  border-radius: 50%;
  margin-right: auto;
}

.toggle-dark-mode {
}
</style>
