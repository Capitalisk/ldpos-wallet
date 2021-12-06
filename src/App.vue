<template>
  <Progressbar :loading="loading" class="progress-bar-top" />
  <Modal />
  <Sidebar />
  <div class="main-content relative">
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
import Progressbar from './components/Progressbar';

import { TOKEN_MODAL } from './components/modals/constants';

export default {
  name: 'App',
  components: { Loading, Modal, Sidebar, Notification, Progressbar },
  provide: { store },
  setup() {
    onMounted(async () => await store.connect());
    onMounted(() =>
      document.documentElement.setAttribute('dark-theme', store.state.darkMode),
    );

    return {
      connected: computed(() => store.state.connected),
      TOKEN_MODAL,
      loading: computed(() => store.state.progressbarLoading),
    };
  },
};
</script>

<style>
@import url('./styles/main.css');

.main-content {
  margin-left: 284px;
  padding: var(--unit-2) var(--unit-2) var(--unit-2) 0;
  width: calc(100% - 285px);
  box-sizing: border-box;
}

.progress-bar-top {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  z-index: 500;
}

@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-top: 56px;
    width: 100%;
    padding: var(--unit-2) 0;
  }
}
</style>
