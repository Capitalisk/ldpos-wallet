export default [
  {
    path: '/accounts/:accounts',
    name: 'AccountId',
    component: () =>
      import(/* webpackChunkName: "accountid" */ '../views/DetailedPage'),
  },
  {
    path: '/accounts/:accounts/transactions',
    name: 'AccountIdTransactions',
    component: () =>
      import(
        /* webpackChunkName: "accountidtransactions" */ '../views/DetailedPage'
      ),
    props: {
      dataTable: true,
      ableToCopyTitle: true,
      title: 'Account Details',
    },
  },
  {
    path: '/transactions/:transactions',
    name: 'TransactionId',
    component: () =>
      import(/* webpackChunkName: "transactionid" */ '../views/DetailedPage'),
    props: {
      title: 'Transaction Details',
    },
  },
  {
    path: '/delegates/:delegates',
    name: 'DelegateId',
    component: () =>
      import(/* webpackChunkName: "delegateid" */ '../views/DetailedPage'),
    props: {
      title: 'Delegate Details',
    },
  },
  {
    path: '/blocks/:blocks',
    name: 'BlockId',
    component: () =>
      import(/* webpackChunkName: "blockid" */ '../views/DetailedPage'),
    props: {
      title: 'Block Details',
      id: 'blocks',
    },
  },
  {
    path: '/:pathMatch(.*)',
    name: 'error 404',
    component: () =>
      import(/* webpackChunkName: "error404" */ '../views/Error404'),
  },
];
