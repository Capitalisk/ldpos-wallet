import { createRouter, createWebHashHistory } from 'vue-router';
import store from '../store';

import details from './details';
import views from './views';

// TODO: add property to environment to force transactions to be the homepage

const routes = [...details, ...views];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from) => {
  store.toggleNav(false);
  // store.initiateOrRenewTimeout();
});

export default router;
