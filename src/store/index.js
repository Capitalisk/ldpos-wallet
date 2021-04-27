import { computed, reactive, readonly, ref } from 'vue';
import ldposClient from 'ldpos-client';

import config from '../config.json';
import router from '../router';

const isDevelopment = process.env.NODE_ENV === 'development';

const defaultConfig = config.clsk;

const state = reactive({
  selectedNetwork: null,
  config: isDevelopment
    ? { ...defaultConfig.testnet, network: 'testnet' }
    : { ...defaultConfig.mainnet, network: 'mainnet' },
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
    title: null,
    data: null,
  },
  darkMode: true,
  notifications: [],
  progressbarLoading: false,
});

export default {
  state: readonly(state),
  client: computed(
    () => state.clients[state.config.networkSymbol][state.selectedNetwork],
  ),
  async connect(
    config = defaultConfig,
    network = isDevelopment ? 'testnet' : 'mainnet',
  ) {
    this.mutateProgressbarLoading(true);
    state.connected = false;

    const networkSymbol = config[network].networkSymbol;
    state.selectedNetwork = network;

    state.config = config[network];
    if (!state.clients.hasOwnProperty(networkSymbol)) {
      state.clients[networkSymbol] = {};
      state.clients[networkSymbol][network] = ldposClient.createClient(
        state.config,
      );
    } else if (
      state.clients.hasOwnProperty(networkSymbol) &&
      !state.clients[networkSymbol].hasOwnProperty(network)
    ) {
      state.clients[networkSymbol][network] = ldposClient.createClient(
        state.config,
      );
    }

    try {
      await state.clients[networkSymbol][network].connect();
    } catch (e) {
      console.log(e);
      state.connected = false;
      this.mutateProgressbarLoading(false);
      throw new Error('Failed to connect to the network.');
    }

    state.connected = true;

    this.mutateProgressbarLoading(false);
  },
  async authenticate(passphrase) {
    const networkSymbol = state.config.networkSymbol;
    const network = state.selectedNetwork;

    state.login.loading = true;
    try {
      state.authenticated = false;

      await state.clients[networkSymbol][network].connect({ passphrase });

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
    this.mutateProgressbarLoading(true);
    state.authenticated = false;

    if (notify)
      this.notify({
        message:
          'You have been logged out automatically after being inactive for 30 minutes.',
      });

    // Disconnect and connect all clients and all nets
    try {
      for (let i = 0; i < Object.keys(state.clients).length; i++) {
        const client = Object.values(state.clients)[i];
        for (let i = 0; i < Object.keys(client).length; i++) {
          const c = Object.value(client)[i];
          await c.disconnect();
          await c.connect();
        }
      }
    } catch (e) {
      console.error(e);
    }
    if (state.authenticated) router.push('/');

    this.mutateProgressbarLoading(false);
  },
  changeModalTitle(title = null) {
    state.modal.title = title;
  },
  toggleModal({ type = null, data = null, title = null } = {}) {
    state.modal.active = !state.modal.active;
    if (state.modal.active) {
      document.documentElement.style.overflow = 'hidden';
      document.body.scroll = 'no';
    } else {
      document.documentElement.style.overflow = 'auto';
      document.body.scroll = 'yes';
    }
    state.modal.type = type;
    state.modal.title = title;
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
