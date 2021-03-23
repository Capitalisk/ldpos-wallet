import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/voting',
    name: 'Voting',
    component: () =>
      import(/* webpackChunkName: "voting" */ '../views/Voting.vue'),
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: () =>
      import(/* webpackChunkName: "wallet" */ '../views/Wallet.vue'),
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () =>
      import(/* webpackChunkName: "transactions" */ '../views/Transactions.vue'),
  },
  {
    path: '/blocks',
    name: 'Blocks',
    component: () =>
      import(/* webpackChunkName: "blocks" */ '../views/Blocks.vue'),
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: () =>
      import(/* webpackChunkName: "accounts" */ '../views/Accounts.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () =>
      import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(() => {
  store.commit('toggleNav', false)
  store.commit('initiateOrRenewTimeout')
})

export default router;
