<template>
  <Modal />
  <Sidebar />
  <div class="main-content">
    <Loading v-if="!connected" />
    <router-view v-else />
  </div>
  <Notification />
</template>

<script>
import { onMounted, ref, watch, computed, inject } from 'vue';

import router from './router';
import store from './store';

import Loading from './components/Loading';
import Modal from './components/Modal';
import Notification from './components/Notification';
import Sidebar from './components/Sidebar';

import { TOKEN_MODAL } from './components/modals/constants';

export default {
  name: 'App',
  components: { Loading, Modal, Sidebar, Notification },
  provide: { store },
  setup() {
    onMounted(async () => await store.connect());
    onMounted(() =>
      document.documentElement.setAttribute('dark-theme', store.state.darkMode),
    );

    const toWallet = () => store.state.authenticated && router.push('/wallet');

    return {
      toWallet,
      connected: computed(() => store.state.connected),
      TOKEN_MODAL,
    };
  },
};
</script>

<style>
@import url('./styles/main.css');

.main-content {
  margin-left: 285px;
  padding: var(--unit-2) var(--unit-2) var(--unit-2) 0;
  width: calc(100% - 285px);
  box-sizing: border-box;
}

@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-top: 50px;
    width: 100%;
    padding: var(--unit-2) 0;
  }
}
</style>
