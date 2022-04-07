export default [
  {
    path: '/accounts/:accountId/transactions',
    name: 'AccountsTransactions',
    component: () =>
      import(
        /* webpackChunkName: "accountstransactions" */ '../views/DetailedPage'
      ),
    props: {
      title: 'Account Transaction Details',
      dataTable: true,
      id: 'accountstransactions',
      // ableToCopyTitle: true,
    },
  },
  {
    path: '/accounts/:accountId',
    name: 'Accounts',
    component: () =>
      import(/* webpackChunkName: "accounts" */ '../views/DetailedPage'),
    props: {
      title: 'Account Details',
      id: 'accounts',
    },
  },
  {
    path: '/transactions/:transactionId',
    name: 'Transactions',
    component: () =>
      import(/* webpackChunkName: "transactions" */ '../views/DetailedPage'),
    props: {
      title: 'Transaction Details',
      id: 'transactions',
    },
  },
  {
    path: '/delegates/:delegateId',
    name: 'Delegates',
    component: () =>
      import(/* webpackChunkName: "delegates" */ '../views/DetailedPage'),
    props: {
      title: 'Delegate Details',
      id: 'delegates',
    },
  },
  {
    path: '/blocks/:blockId',
    name: 'Blocks',
    component: () =>
      import(/* webpackChunkName: "blocks" */ '../views/DetailedPage'),
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
