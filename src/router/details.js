export default [
  {
    path: '/wallet/:wallet',
    name: 'Wallet details',
    component: () =>
      import(/* webpackChunkName: "walletid" */ '../views/DetailedPage'),
  },
  {
    path: '/wallet/:wallet/transactions',
    name: 'Wallet transaction details',
    component: () =>
      import(/* webpackChunkName: "walletidtransactions" */ '../views/DetailedPage'),
    props: {
      dataTable: true,
    },
  },
  {
    path: '/transaction/:transaction',
    name: 'Transaction details',
    component: () =>
      import(
        /* webpackChunkName: "transactionid" */ '../views/DetailedPage'
      ),
  },
  {
    path: '/delegate/:delegate',
    name: 'Delegate details',
    component: () =>
      import(/* webpackChunkName: "delegateid" */ '../views/DetailedPage'),
  },
  {
    path: '/block/:block',
    name: 'Block details',
    component: () =>
      import(/* webpackChunkName: "blockid" */ '../views/DetailedPage'),
  },
  {
    path: '/:pathMatch(.*)',
    name: 'Error 404',
    component: () =>
      import(/* webpackChunkName: "error404" */ '../views/Error404'),
  },
];
