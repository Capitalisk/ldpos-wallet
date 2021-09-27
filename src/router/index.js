import { createRouter, createWebHashHistory } from 'vue-router';
import store from '../store';

import views from './views'
import details from './details'

// TODO: add property to environment to force transactions to be the homepage

const routes = [
  ...views,
  ...details,
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(() => {
  store.toggleNav(false);
  // store.initiateOrRenewTimeout();
});

export default router;
