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
import { onMounted, ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import router from './router';

import Loading from './components/parts/Loading';
import Modal from './components/parts/Modal';
import Notification from './components/parts/Notification';
import Sidebar from './components/sections/Sidebar';

import { TOKEN_MODAL } from './components/modals/constants';

export default {
  name: 'App',
  components: { Loading, Modal, Sidebar, Notification },
  setup() {
    const store = useStore();

    onMounted(async () => await store.commit('connect'));
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
  padding: 1rem 1rem 1rem 0;
  width: calc(100% - 285px);
  box-sizing: border-box;
}

@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-top: 50px;
    width: 100%;
    padding: 1rem 0;
  }
}
</style>
