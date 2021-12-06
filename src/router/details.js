export default [
  {
    path: '/accounts/:accounts',
    name: 'account details',
    component: () =>
      import(/* webpackChunkName: "accountid" */ '../views/DetailedPage'),
  },
  {
    path: '/accounts/:accounts/transactions',
    name: 'account transaction details',
    component: () =>
      import(
        /* webpackChunkName: "accountidtransactions" */ '../views/DetailedPage'
      ),
    props: {
      dataTable: true,
      ableToCopyTitle: true,
    },
  },
  {
    path: '/transactions/:transactions',
    name: 'transaction details',
    component: () =>
      import(/* webpackChunkName: "transactionid" */ '../views/DetailedPage'),
  },
  {
    path: '/delegates/:delegates',
    name: 'delegate details',
    component: () =>
      import(/* webpackChunkName: "delegateid" */ '../views/DetailedPage'),
  },
  {
    path: '/blocks/:blocks',
    name: 'block details',
    component: () =>
      import(/* webpackChunkName: "blockid" */ '../views/DetailedPage'),
    props: {
      supressLinks: true,
    },
  },
  {
    path: '/:pathMatch(.*)',
    name: 'error 404',
    component: () =>
      import(/* webpackChunkName: "error404" */ '../views/Error404'),
  },
];
