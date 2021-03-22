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

        setTimeout(async () => {
          console.log('logging out 15min passed...');
          await this.commit('deauthenticate');
        }, 15 * 1000 * 60);

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
    toggleNav: (state, action) => (state.nav = action || !state.nav),
  },
  getters: {},
  setters: {},
});
