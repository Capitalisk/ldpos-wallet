<template>
  <div class="navbar align-center fullwidth">
    <div class="mr-auto">
      <Button value="Sign in" router-link href="/login" />
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
    <a to="/" class="first" @click="toggleModal(TOKENMODAL)"
      ><i class="fa fa-coins mr-1" />CLSK</a
    >
    <hr />
    <router-link to="/"><i class="fa fa-home mr-1" />DASHBOARD </router-link>
    <a @click="toWallet" :class="authenticated ? '' : 'disabled'">
      <i class="fa fa-wallet mr-1" />WALLET
    </a>
    <router-link to="/delegates">
      <i class="fa fa-poll mr-1" />VOTING
    </router-link>
    <hr />
    <router-link to="/transactions">
      <i class="fa fa-exchange-alt mr-1" />TRANSACTIONS
    </router-link>
    <router-link to="/"> <i class="fa fa-th-large mr-1" />BLOCKS </router-link>
    <router-link to="/"> <i class="fa fa-users mr-1" />ACCOUNTS </router-link>
    <router-link to="/" class="last">
      <i class="fa fa-users-cog mr-1" />DELEGATES
    </router-link>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

import Button from '../parts/Button';

import { TOKENMODAL } from '../modals/constants';
import router from '../../router';

export default {
  name: 'Sidebar',
  setup() {
    const store = useStore();

    const toWallet = () => store.state.authenticated && router.push('/wallet');

    return {
      toggleModal: (type) => store.commit('toggleModal', type),
      authenticated: computed(() => store.state.authenticated),
      toggleBurger: () => store.commit('toggleNav'),
      burgerActive: computed(() => store.state.nav),
      TOKENMODAL,
      toWallet,
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
  margin: 1rem;
  border-radius: var(--border-radius);
  /* background: linear-gradient(-30deg, var(--primary), var(--primary-lightest)); */
  background-color: var(--primary);
  color: var(--white);
  text-transform: uppercase;
  box-shadow: 0px 0px 10px 2px var(--primary-darkest);
  z-index: 1;
}

.sidebar hr {
  border: 0;
  border-top: 1px solid rgba(12, 138, 228, 0.4);
  border-width: 1px;
}

.sidebar a {
  color: var(--dark);
  text-decoration: none;
  padding: 1rem;
  display: block;
  font-size: 12px;
  cursor: pointer;
}

a.disabled {
  color: var(--disabled);
  cursor: default;
  user-select: none;
}

a.disabled:hover {
  background-color: initial !important;
}

.sidebar a:hover {
  background-color: var(--primary-lightest);
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
    width: 100%;
    justify-content: flex-end;
    z-index: 2;
    padding: 0.5rem;
    right: 0;
    top: 0;
    background-color: var(--primary);
    height: 40px;
  }

  .sidebar-active {
    visibility: visible !important;
    opacity: 1 !important;
    height: auto !important;
    transition: opacity 0.5s linear;
  }

  .sidebar {
    position: absolute;
    top: 56px;
    visibility: hidden;
    width: 100%;
    margin: 0;
    border-radius: var(--no-border-radius);
    opacity: 0;
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
