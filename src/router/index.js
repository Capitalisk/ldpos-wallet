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
    path: '/delegates',
    name: 'Delegates',
    component: () =>
      import(/* webpackChunkName: "delegates" */ '../views/Delegates.vue'),
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

router.beforeEach(() => store.commit('toggleNav', false))

export default router;
