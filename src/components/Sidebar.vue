<template>
  <div class="navbar align-center fullwidth">
    <div class="mr-auto">
      <Button
        value="Sign in"
        router-link
        href="/"
        v-if="!authenticated && $router.currentRoute.value.path !== '/'"
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
  <div :class="`sidebar${burgerActive ? ' sidebar-active' : ''}`">
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
    <router-link :to="{ name: isElectron ? 'Wallet' : 'Transactions' }">
      <i class="fa fa-wallet mr-1" v-if="isElectron" />
      <i class="fa fa-exchange-alt mr-1" v-else />
      {{ isElectron ? 'WALLET' : 'TRANSACTIONS' }}
    </router-link>
    <router-link to="/voting">
      <i class="fa fa-poll mr-1" />
      {{ authenticated ? 'VOTING' : 'DELEGATES' }}
    </router-link>
    <hr v-if="isElectron" />
    <router-link :to="{ name: isElectron ? 'Transactions' : 'Wallet' }">
      <i class="fa fa-exchange-alt mr-1" v-if="isElectron" />
      <i class="fa fa-wallet mr-1" v-else />
      {{ isElectron ? 'TRANSACTIONS' : 'WALLET' }}
    </router-link>
    <router-link to="/blocks">
      <i class="fa fa-th-large mr-1" />
      BLOCKS
    </router-link>
    <router-link to="/accounts">
      <i class="fa fa-users mr-1" />
      ACCOUNTS
    </router-link>
    <hr />
    <router-link to="/blockchains" class="last">
      <i class="fa fa-user-cog mr-1" />
      BLOCKCHAINS
    </router-link>
  </div>
</template>

<script>
import { computed, inject, ref } from 'vue';

import Button from './Button';

import { TOKEN_MODAL, ADD_TOKEN_MODAL } from './modals/constants';

export default {
  name: 'Sidebar',
  setup() {
    const store = inject('store');

    return {
      authenticated: computed(() => store.state.authenticated),
      burgerActive: computed(() => store.state.nav),
      networkSymbol: computed(() =>
        store.state.config.networkSymbol.toUpperCase(),
      ),
      TOKEN_MODAL,
      ADD_TOKEN_MODAL,
      toggleOrBrowseModal: m => store.toggleOrBrowseModal(m),
      toggleBurger: () => store.toggleNav(),
      deauthenticate: () => store.deauthenticate(),
      isElectron: process.env.IS_ELECTRON,
      isDevelopment: process.env.NODE_ENV === 'development',
    };
  },
  components: { Button },
};
</script>

<style scoped>
.navbar {
  display: none;
}

.sidebar {
  position: fixed;
  width: 250px;
  padding: 0;
  margin: var(--unit-2);
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
  background-color: var(--primary-lightest);
  color: var(--permanent-white);
}

.router-link-active {
  background-color: var(--secondary);
  color: var(--primary-lightest);
}

a.router-link-active::before {
  content: '';
  position: absolute;
  width: 4px;
  left: 0px;
  top: 0px;
  bottom: 0px;
  background: var(--primary-lightest);
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
