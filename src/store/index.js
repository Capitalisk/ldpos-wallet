import { computed, reactive, readonly, ref } from 'vue';
import ldposClient from 'ldpos-client';

import config from '../config.json';
import router from '../router';

const isDevelopment = process.env.NODE_ENV === 'development';

const firstKey = Object.keys(config)[0] || 'clsk';
const defaultConfig = config[firstKey];
let notificationIndex = 0;

const state = reactive({
  selectedNetwork: null,
  config: { ...defaultConfig.mainnet, network: 'mainnet' },
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
    // Used for navigation through modals and being able to go back
    stack: [],
    routerGoBack: false,
  },
  darkMode: true,
  notifications: {},
  progressLoadingCount: 0,
  progressBarLoading: false,
});

export default {
  state: readonly(state),
  client: computed(
    () => state.clients[state.config.networkSymbol][state.selectedNetwork],
  ),
  async connect(
    config = defaultConfig,
    network = 'mainnet',
  ) {
    this.incrementLoadingCount();
    state.connected = false;

    await this.reconnectAllClients();

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
      console.error(e);
      state.connected = false;
      this.decrementLoadingCount();
      throw new Error('Failed to connect to the network.');
    }

    state.connected = true;

    let currentRoute = router.currentRoute.value.name;
    if (currentRoute === 'wallet') {
      try {
        await this.attemptReauthenticate(true);
      } catch (e) {}
    }

    if (state.authenticated) router.push({ name: 'wallet' });

    this.decrementLoadingCount();
  },
  async attemptReauthenticate(notify) {
    const credsString = localStorage.getItem('ldpos-credentials');
    if (!credsString) {
      throw new Error('Log in required');
    }
    if (notify) {
      this.notify({
        message: 'Logging in using existing credentials...'
      }, 5);
    }
    const creds = JSON.parse(atob(credsString));
    const options = {};
    if (creds.walletAddress) {
      options.walletAddress = creds.walletAddress;
    }
    await this.authenticate(creds.passphrase, options);
  },
  async authenticate(passphrase, options) {
    const networkSymbol = state.config.networkSymbol;
    const network = state.selectedNetwork;

    state.login.loading = true;
    try {
      state.authenticated = false;

      const client = state.clients[networkSymbol][network];
      await client.connect({
        passphrase,
        ...options,
      });

      try {
        await client.syncKeyIndex('sig');
      } catch (err) {
        if (
          !err.sourceError ||
          err.sourceError.name !== 'AccountDidNotExistError'
        ) {
          throw err;
        }
      }

      state.authenticated = true;

    } catch (e) {
      state.login.loading = false;
      state.authenticated = false;
      state.login.error = e.message;
      throw e;
    }
    state.login.loading = false;
  },
  async reconnectAllClients() {
    try {
      const values = Object.values(state.clients);
      for (let i = 0; i < Object.keys(state.clients).length; i++) {
        const client = values[i];
        const clientValues = Object.values(client);
        for (let i = 0; i < Object.keys(client).length; i++) {
          const c = clientValues[i];
          await c.disconnect();
          await c.connect();
        }
      }
    } catch (e) {
      console.error(e);
    }
  },
  async deauthenticate() {
    this.incrementLoadingCount();
    state.authenticated = false;
    localStorage.removeItem('ldpos-credentials');

    // Disconnect and connect all clients and all nets
    await this.reconnectAllClients();

    if (state.authenticated) router.push({ name: 'wallet' });

    this.decrementLoadingCount();
  },
  toggleOrBrowseModal({
    type = null,
    data = null,
    title = null,
    back = false,
    hasPrefix = false,
    prependFn = null,
  } = {}) {
    // We changed the URL on opening the modal we need to change it back when we close it.
    if (state.modal.routerGoBack) {
      window.history.go(-1);
      state.modal.routerGoBack = false;
    }
    if (hasPrefix) {
      state.modal.routerGoBack = true;
    }

    // We want the modal to be stackable, opening a model inside a modal and return to the previous model
    if (!type && !back) {
      state.modal.active = false;
      state.modal.stack = [];
    } else {
      if (back) state.modal.stack = state.modal.stack.slice(0, -1);
      else state.modal.stack.push({ type, data, title, prependFn });

      const i = state.modal.stack.length - 1;
      state.modal.type = state.modal.stack[i].type;
      state.modal.title = state.modal.stack[i].title;
      state.modal.data = state.modal.stack[i].data;
      state.modal.prependFn = state.modal.stack[i].prependFn;
      state.modal.active = true;
    }

    // state.modal.active = !state.modal.active;
    if (state.modal.active) {
      document.documentElement.style.overflow = 'hidden';
      document.body.scroll = 'no';
    } else {
      document.documentElement.style.overflow = 'auto';
      document.body.scroll = 'yes';
    }
  },
  toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.documentElement.setAttribute('dark-theme', state.darkMode);
  },
  toggleNav: (action) => (state.nav = action === false ? action : !state.nav),

  notify({ message, error = false }, seconds = null) {
    const currentIndex = notificationIndex++;

    if (state.notifications[currentIndex]) return;
    state.notifications[currentIndex] = {
      id: currentIndex,
      message,
      error,
      seconds,
      secondsLeft: seconds,
    };

    if (seconds) {
      setTimeout(() =>
        state.notifications[currentIndex] &&
        state.notifications[currentIndex].secondsLeft--
      );

      const interval = setInterval(
        () =>
          state.notifications[currentIndex] &&
          state.notifications[currentIndex].secondsLeft > 0 &&
          state.notifications[currentIndex].secondsLeft--,
        1000,
      );

      setTimeout(() => {
        this.denotify(currentIndex);
        clearInterval(interval);
      }, seconds * 1000);
    }
  },
  denotify: (notificationId) => {
    delete state.notifications[notificationId];
  },
  incrementLoadingCount: () => {
    state.progressLoadingCount++;
    state.progressBarLoading = true;
  },
  decrementLoadingCount: () => {
    state.progressLoadingCount--;
    if (state.progressLoadingCount <= 0) {
      state.progressLoadingCount = 0;
      state.progressBarLoading = false;
    }
  },
};
