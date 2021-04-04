import { reactive, readonly, ref } from 'vue';
import ldposClient from 'ldpos-client';

import router from '../router';

const defaultConfig = {
  hostname: '34.227.22.98',
  port: '7001',
  networkSymbol: 'clsk',
  chainModuleName: 'capitalisk_chain',
};

const client = ref(null);

const state = reactive({
  config: defaultConfig,
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
    this.mutateProgressbarLoading(true)

    state.connected = false;
    state.config = config;
    client.value = null;
    client.value = ldposClient.createClient(config);
    try {
      await client.value.connect();
    } catch (e) {
      console.error(e);
    }
    state.connected = true;

    this.mutateProgressbarLoading(false)
  },
  async authenticate(passphrase) {
    state.login.loading = true;
    try {
      state.authenticated = false;

      await client.value.connect({ passphrase });
      state.authenticated = true;

      this.initiateOrRenewTimeout();
    } catch (e) {
      console.error(e);
      state.login.error = e.message;
      state.authenticated = false;
    }
    state.login.loading = false;
    if (state.authenticated) router.push('/');
  },
  async deauthenticate(notify = false) {
    this.mutateProgressbarLoading(true)

    if (notify)
      this.notify(
        'You have been logged out automatically after being inactive for 30 minutes.',
      );
    try {
      await client.value.disconnect();
      await this.connect();
    } catch (e) {
      console.error(e);
    }
    state.authenticated = false;
    if (state.authenticated) router.push('/');

    this.mutateProgressbarLoading(false)
  },
  toggleModal({ type = null, data = null } = {}) {
    state.modal.active = !state.modal.active;
    state.modal.type = type;
    state.modal.data = data;
  },
  toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.documentElement.setAttribute('dark-theme', state.darkMode);
  },
  toggleNav: (action) => (state.nav = action === false ? action : !state.nav),
  initiateOrRenewTimeout() {
    if (!state.authenticated) return;
    state.authenticationTimeout && clearTimeout(state.authenticationTimeout);
    state.authenticationTimeout = setTimeout(async () => {
      console.log('logging out 30min passed...');
      await this.deauthenticate(true);
    }, 30 * 1000 * 60);
  },
  notify(message, seconds = null) {
    if (state.notifications.includes(message)) return;
    if (state.notifications.length === 3) state.notifications.splice(0, 1);
    state.notifications.push(message);

    if (seconds)
      setTimeout(() => {
        const index = state.notifications.findIndex((m) => m === message);
        this.denotify(index);
      }, seconds * 1000);
  },
  denotify: (index) => {
    state.notifications.splice(index, 1);
  },
  mutateProgressbarLoading: (val) => (state.progressbarLoading = val),
};
