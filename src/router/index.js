import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';

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

export default router;
