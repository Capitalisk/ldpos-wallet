export default [
  {
    path: '/accounts/:accountId/transactions',
    name: 'AccountTransactions',
    component: () =>
      import(
        /* webpackChunkName: "accountstransactions" */ '../views/DetailedPage'
      ),
    props: {
      title: 'Account Transaction List',
      dataTable: true,
      id: 'accounttransactions',
      // ableToCopyTitle: true,
      showDirection: true,
    },
  },
  {
    path: '/accounts/:accountId/votes',
    name: 'AccountVotes',
    component: () =>
      import(
        /* webpackChunkName: "accountstransactions" */ '../views/VotingListPage'
      ),
    props: {
      title: 'Account Vote List',
      dataTable: true,
      id: 'accountvotes',
      // ableToCopyTitle: true,
    },
  },
  {
    path: '/blocks/:blockId/transactions',
    name: 'BlockTransactions',
    component: () =>
      import(
        /* webpackChunkName: "blocktransactions" */ '../views/DetailedPage'
      ),
    props: {
      title: 'Block Transaction List',
      dataTable: true,
      id: 'blocktransactions',
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
    path: '/delegates/:delegateId/voters',
    name: 'DelegateVoters',
    component: () =>
      import(
        /* webpackChunkName: "accountstransactions" */ '../views/VotingListPage'
      ),
    props: {
      title: 'Delegate Voter List',
      dataTable: true,
      id: 'delegatevoters',
      // ableToCopyTitle: true,
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
