<template>
  <div id="app">
    <Modal />
    <Sidebar />
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
import Modal from './components/parts/Modal';
import Sidebar from './components/sections/Sidebar';

import { TOKENMODAL } from './components/modals/constants';

export default {
  name: 'App',
  components: { Loading, Modal, Sidebar },
  setup() {
    const store = useStore();

    onMounted(async () => await store.commit('connect'));
    onMounted(() => document.documentElement.setAttribute('dark-theme', store.state.darkMode))

    const toWallet = () => store.state.authenticated && router.push('/wallet');

    return {
      toWallet,
      connected: computed(() => store.state.connected),
      TOKENMODAL,
    };
  },
};
</script>

<style>
@import url('./styles/main.css');

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

@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-top: 50px;
  }
}
</style>
