<template>
  <div class="navbar align-center fullwidth">
    <div class="mr-auto">
      <Button
        value="Sign in"
        router-link
        :href="{ name: 'wallet' }"
        v-if="!authenticated && $router.currentRoute.value.name !== 'wallet'"
      />
      <Button
        value="Sign out"
        @click="deauthenticate"
        v-else-if="authenticated"
      />
    </div>
    <div
      :class="burgerActive ? 'change cursor-pointer' : 'cursor-pointer'"
      @click="toggleBurger"
    >
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
    </div>
  </div>
  <div class="sidebar ma-2 box-shadow-white" :class="{ 'sidebar-active': burgerActive }">
    <a
      to="/"
      class="first"
      @click="
        toggleOrBrowseModal({
          type: TOKEN_MODAL,
          title: 'Connect to an existing network',
        })
      "
    >
      <div class="flex justify-end">
        Blockchain: {{ networkSymbol }}
        <i class="fa fa-cog ml-auto" />
      </div>
    </a>
    <hr />
    <router-link
      class="navbar-link"
      :to="{ name: useAsWallet ? 'wallet' : 'transactions' }"
    >
      <i class="fa fa-wallet mr-1" v-if="useAsWallet" />
      <i class="fa fa-exchange-alt mr-1" v-else />
      {{ useAsWallet ? 'WALLET' : 'TRANSACTIONS' }}
    </router-link>
    <router-link class="navbar-link" to="/delegates">
      <i class="fa fa-poll mr-1" />
      {{ authenticated ? 'VOTING' : 'DELEGATES' }}
    </router-link>
    <hr v-if="useAsWallet" />
    <router-link
      class="navbar-link"
      :to="{ name: useAsWallet ? 'transactions' : 'wallet' }"
    >
      <i class="fa fa-exchange-alt mr-1" v-if="useAsWallet" />
      <i class="fa fa-wallet mr-1" v-else />
      {{ useAsWallet ? 'TRANSACTIONS' : 'WALLET' }}
    </router-link>
    <router-link class="navbar-link" to="/blocks">
      <i class="fa fa-th-large mr-1" />
      BLOCKS
    </router-link>
    <router-link class="navbar-link" to="/accounts">
      <i class="fa fa-users mr-1" />
      ACCOUNTS
    </router-link>
    <hr />
    <router-link class="navbar-link last" to="/blockchains">
      <i class="fa fa-user-cog mr-1" />
      BLOCKCHAINS
    </router-link>
  </div>
  <div class="ma-2 connected">
    <Connected />
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';

import Button from './Button';
import Connected from './Connected';

import { TOKEN_MODAL } from './modals/constants';

const store = inject('store');

const authenticated = computed(() => store.state.authenticated);
const burgerActive = computed(() => store.state.nav);
const networkSymbol = computed(() =>
  store.state.config.networkSymbol.toUpperCase(),
);
const toggleOrBrowseModal = (m) => store.toggleOrBrowseModal(m);
const toggleBurger = () => store.toggleNav();
const deauthenticate = () => store.deauthenticate();
const useAsWallet = process.env.VUE_APP_USE_AS_WALLET === 'true';
</script>

<style scoped>
.navbar {
  display: none;
}

.connected {
  position: fixed;
  top: 360px;
  width: 250px;
}

.sidebar {
  position: fixed;
  width: 250px;
  padding: 0;
  border-radius: var(--border-radius);
  background-color: var(--primary);
  color: var(--white);
  text-transform: uppercase;
  z-index: 1;
}

.sidebar a {
  color: var(--dark);
  text-decoration: none;
  padding: var(--unit-2);
  display: block;
  font-size: 12px;
  cursor: pointer;
  position: relative;
}

a.disabled {
  color: var(--disabled);
  cursor: default;
  user-select: none;
}

a.disabled:hover {
  background-color: initial !important;
  color: var(--disabled) !important;
}

.sidebar a:hover {
  background-color: var(--primary-lighter);
  color: var(--permanent-white);
}

.router-link-active.navbar-link {
  background-color: var(--primary-darker);
  color: var(--primary-lighter);
}

a.router-link-active.navbar-link::before {
  content: '';
  position: absolute;
  width: 4px;
  left: 0px;
  top: 0px;
  bottom: 0px;
  background: var(--primary-lighter);
}

a.router-link-active.last::before {
  border-bottom-left-radius: var(--border-radius);
}

a.router-link-active.first::before {
  border-top-left-radius: var(--border-radius);
}

.first {
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

.last {
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

@media screen and (max-width: 768px) {
  .navbar {
    display: flex;
    width: auto;
    justify-content: flex-end;
    z-index: 2;
    padding: var(--unit-1);
    left: 0;
    right: 0;
    top: 0;
    background-color: var(--primary);
    height: 40px;
    position: fixed;
  }

  .sidebar-active {
    visibility: visible !important;
    opacity: 1 !important;
    height: auto !important;
    transition: opacity 0.5s linear;
  }

  .sidebar {
    position: fixed;
    top: 56px;
    visibility: hidden;
    width: 100%;
    margin: 0;
    border-radius: var(--no-border-radius);
    opacity: 0;
    box-shadow: 0px 0px 10px 2px var(--primary-darkest);
  }

  .first,
  .last {
    border-radius: var(--no-border-radius);
  }

  .bar1,
  .bar2,
  .bar3 {
    width: 25px;
    height: 3px;
    background-color: var(--dark);
    margin: 6px 0;
    transition: 0.4s;
  }

  .change .bar1 {
    transform: rotate(-45deg) translate(-7px, 6px);
  }

  .change .bar2 {
    opacity: 0;
  }

  .change .bar3 {
    transform: rotate(45deg) translate(-6px, -6px);
  }
}
</style>
