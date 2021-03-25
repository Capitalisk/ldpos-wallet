import { createStore } from 'vuex';
import router from '../router';

import ldposClient from 'ldpos-client';

const defaultConfig = {
  hostname: '34.227.22.98',
  port: '7001',
  networkSymbol: 'clsk',
  chainModuleName: 'capitalisk_chain',
};

export default createStore({
  state() {
    return {
      config: defaultConfig,
      client: null,
      connected: false,
      authenticated: false,
      authenticationTimeout: null,
      nav: false,
      login: {
        loading: false,
        error: null,
      },
      modal: {
        active: false,
        type: null,
        data: null,
      },
      darkMode:
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches,
      notifications: [],
    };
  },
  mutations: {
    async connect(state, config = defaultConfig) {
      state.config = config;
      state.client = null;
      state.client = ldposClient.createClient(config);
      await state.client.connect();
      state.connected = true;
    },
    async authenticate(state, passphrase) {
      state.login.loading = true;
      try {
        state.authenticated = false;

        await state.client.connect({ passphrase });
        state.authenticated = true;

        this.commit('initiateOrRenewTimeout');

        if (state.authenticated) router.push('/');
      } catch (e) {
        state.login.error = e.message;
        state.authenticated = false;
      }
      state.login.loading = false;
    },
    async deauthenticate(state) {
      try {
        await state.client.disconnect();
        await this.commit('connect');
      } catch (e) {
        console.error(e);
      }
      state.connected = false;
      state.authenticated = false;
    },
    toggleModal(state, { type = null, data = null } = {}) {
      state.modal.active = !state.modal.active;
      state.modal.type = type;
      state.modal.data = data;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      document.documentElement.setAttribute('dark-theme', state.darkMode);
    },
    toggleNav: (state, action) =>
      (state.nav = action === false ? action : !state.nav),
    initiateOrRenewTimeout: (state) => {
      const self = this;
      if (!state.authenticated) return;
      state.authenticationTimeout && clearTimeout(state.authenticationTimeout);
      state.authenticationTimeout = setTimeout(async () => {
        console.log('logging out 15min passed...');
        await self.commit('deauthenticate');
      }, 1 * 1000 * 60);
    },
    notify: (state, message) => {
      if (state.notifications.includes(message)) return;
      if (state.notifications.length === 3) state.notifications.splice(0, 1);
      state.notifications.push(message);
    },
    denotify: (state, index) => {
      state.notifications.splice(index, 1);
    },
  },
  getters: {},
  setters: {},
});
