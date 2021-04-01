import { createRouter, createWebHashHistory } from 'vue-router';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () =>
      import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  {
    path: '/voting',
    name: 'Voting',
    component: () =>
      import(/* webpackChunkName: "voting" */ '../views/Voting.vue'),
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () =>
      import(
        /* webpackChunkName: "transactions" */ '../views/Transactions.vue'
      ),
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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(() => {
  store.toggleNav(false);
  store.initiateOrRenewTimeout();
});

export default router;
