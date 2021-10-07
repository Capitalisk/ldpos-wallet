export default [
  {
    path: '/accounts/:account',
    name: 'account details',
    component: () =>
      import(/* webpackChunkName: "accountid" */ '../views/DetailedPage'),
  },
  {
    path: '/accounts/:account/transactions',
    name: 'account transaction details',
    component: () =>
      import(/* webpackChunkName: "accountidtransactions" */ '../views/DetailedPage'),
    props: {
      dataTable: true,
      ableToCopyTitle: true,
    },
  },
  {
    path: '/transactions/:transaction',
    name: 'transaction details',
    component: () =>
      import(
        /* webpackChunkName: "transactionid" */ '../views/DetailedPage'
      ),
  },
  {
    path: '/delegates/:delegate',
    name: 'delegate details',
    component: () =>
      import(/* webpackChunkName: "delegateid" */ '../views/DetailedPage'),
  },
  {
    path: '/blocks/:block',
    name: 'block details',
    component: () =>
      import(/* webpackChunkName: "blockid" */ '../views/DetailedPage'),
  },
  {
    path: '/:pathMatch(.*)',
    name: 'error 404',
    component: () =>
      import(/* webpackChunkName: "error404" */ '../views/Error404'),
  },
];
