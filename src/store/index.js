import { reactive, readonly, ref } from 'vue';
import ldposClient from 'ldpos-client';

import configs from '../config.json';
import router from '../router';

const isDevelopment = process.env.NODE_ENV === 'development';

const defaultConfig = isDevelopment
  ? configs[0].testnet
    ? configs[0].testnet
    : configs[0].mainnet
  : configs[0].mainnet;

const client = ref(null);

const state = reactive({
  activeClientIndex: 0,
  config: defaultConfig,
  clients: [],
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
  darkMode: true,
  notifications: [],
  progressbarLoading: false,
});

export default {
  state: readonly(state),
  client,
  async connect(config = defaultConfig) {
    this.mutateProgressbarLoading(true);

    let clientIndex = state.clients.findIndex(
      c => JSON.stringify(c.options) === JSON.stringify(config),
    );

    if (clientIndex === -1) {
      state.connected = false;
      state.config = config;
      client.value = ldposClient.createClient(config);
      state.clients.push(client.value);
      clientIndex = 0;
    }

    try {
      if (clientIndex === 0) {
        await state.clients[clientIndex].connect();
        state.activeClientIndex = clientIndex;
      } else {
        await state.clients[state.activeClientIndex].connect();
        state.activeClientIndex = state.clients.length - 1;
      }
    } catch (e) {
      state.connected = true;
      this.mutateProgressbarLoading(false);
      throw new Error('Failed to connect to the network.');
    }
    state.connected = true;

    this.mutateProgressbarLoading(false);
  },
  async authenticate(passphrase) {
    state.login.loading = true;
    try {
      state.authenticated = false;

      await state.clients[state.activeClientIndex].connect({ passphrase });
      state.authenticated = true;

      this.initiateOrRenewTimeout();
    } catch (e) {
      console.error(e);
      state.login.error = e.message;
      state.authenticated = false;
    }
    client.value = state.clients[state.activeClientIndex];
    state.login.loading = false;
    if (state.authenticated) router.push('/');
  },
  async deauthenticate(notify = false) {
    this.mutateProgressbarLoading(true);
    state.authenticated = false;

    if (notify)
      this.notify({
        message:
          'You have been logged out automatically after being inactive for 30 minutes.',
      });

    try {
      for (let i = 0; i < state.clients.length; i++) {
        const client = state.clients[i];
        await client.disconnect();
        await client.connect();
      }
    } catch (e) {
      console.error(e);
    }
    if (state.authenticated) router.push('/');

    this.mutateProgressbarLoading(false);
  },
  toggleModal({ type = null, data = null } = {}) {
    state.modal.active = !state.modal.active;
    if (state.modal.active) {
      document.documentElement.style.overflow = 'hidden';
      document.body.scroll = 'no';
    } else {
      document.documentElement.style.overflow = 'auto';
      document.body.scroll = 'yes';
    }
    state.modal.type = type;
    state.modal.data = data;
  },
  toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.documentElement.setAttribute('dark-theme', state.darkMode);
  },
  toggleNav: action => (state.nav = action === false ? action : !state.nav),
  initiateOrRenewTimeout() {
    if (!state.authenticated) return;
    state.authenticationTimeout && clearTimeout(state.authenticationTimeout);
    state.authenticationTimeout = setTimeout(async () => {
      console.log('logging out 30min passed...');
      await this.deauthenticate(true);
    }, 30 * 1000 * 60);
  },
  notify({ message, error = false }, seconds = null) {
    for (let i = 0; i < state.notifications.length; i++) {
      const n = state.notifications[i];
      if (n.message === message) return;
    }

    if (state.notifications.length === 3) state.notifications.splice(0, 1);
    state.notifications.push({ message, error });

    if (seconds)
      setTimeout(() => {
        const index = state.notifications.findIndex(m => m === message);
        this.denotify(index);
      }, seconds * 1000);
  },
  denotify: index => {
    state.notifications.splice(index, 1);
  },
  mutateProgressbarLoading: val => (state.progressbarLoading = val),
};
