export default [
  {
    path: '/',
    name: process.env.IS_ELECTRON ? 'Wallet' : 'Transactions',
    component: () =>
      process.env.IS_ELECTRON
        ? import(/* webpackChunkName: "login" */ '../views/Login')
        : import(
            /* webpackChunkName: "transactions" */ '../views/Transactions'
          ),
  },
  {
    path: '/voting',
    name: 'Voting',
    component: () =>
      import(/* webpackChunkName: "voting" */ '../views/Voting'),
  },
  {
    path: process.env.IS_ELECTRON ? '/transactions' : '/login',
    name: process.env.IS_ELECTRON ? 'Transactions' : 'Wallet',
    component: () =>
      process.env.IS_ELECTRON
        ? import(
            /* webpackChunkName: "transactions" */ '../views/Transactions'
          )
        : import(/* webpackChunkName: "login" */ '../views/Login'),
  },
  {
    path: '/blocks',
    name: 'Blocks',
    component: () =>
      import(/* webpackChunkName: "blocks" */ '../views/Blocks'),
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: () =>
      import(/* webpackChunkName: "accounts" */ '../views/Accounts'),
  },
  {
    path: '/blockchains',
    name: 'Blockchains',
    component: () =>
      import(/* webpackChunkName: "blockchains" */ '../views/Blockchains'),
  },
];
