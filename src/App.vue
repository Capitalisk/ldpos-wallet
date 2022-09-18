<template>
  <Progressbar :loading="loading" class="progress-bar-top" />
  <Modal />
  <Sidebar />
  <div class="main-content relative">
    <Loading v-if="!connected" />
    <router-view v-else v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <!-- We need to re-render DataTable to update the info, by using :key we force the DataTable to remount itself,
         we don't use fullPath because it includes query params, these are used for pagination -->
        <div :key="route.path">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
  </div>
  <Notification />
</template>

<script setup>
import { onMounted, computed, onUnmounted, provide } from 'vue';

import store from './store';

import Loading from './components/Loading';
import Modal from './components/Modal';
import Notification from './components/Notification';
import Sidebar from './components/Sidebar';
import Progressbar from './components/Progressbar';

import { TOKEN_MODAL } from './components/modals/constants';

provide('store', store);

const clickEvent = event => {
  event.stopPropagation();
  window.dispatchEvent(
    new CustomEvent('Document:click', { detail: event.target }),
  );
};

onMounted(async () => {
  document.documentElement.setAttribute('dark-theme', store.state.darkMode);
  window.requestAnimationFrame(() => {
    document.addEventListener('mousedown', clickEvent);
  });
  await store.connect();
});

onUnmounted(() => {
  document.removeEventListener('mousedown', clickEvent);
});

const connected = computed(() => store.state.connected);
const loading = computed(() => store.state.progressbarLoading);
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

.animation-absolute {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

@media screen and (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-top: 56px;
    width: 100%;
    padding: 0 0 var(--unit-2);
  }
}
</style>
