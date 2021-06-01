export default [
  {
    path: '/',
    name: process.env.IS_ELECTRON ? 'wallet' : 'transactions',
    component: () =>
      process.env.IS_ELECTRON
        ? import(/* webpackChunkName: "login" */ '../views/Login')
        : import(
            /* webpackChunkName: "transactions" */ '../views/Transactions'
          ),
  },
  {
    path: '/delegates',
    name: 'delegates',
    component: () =>
      import(/* webpackChunkName: "delegates" */ '../views/Delegates'),
  },
  {
    path: process.env.IS_ELECTRON ? '/transactions' : '/login',
    name: process.env.IS_ELECTRON ? 'transactions' : 'wallet',
    component: () =>
      process.env.IS_ELECTRON
        ? import(
            /* webpackChunkName: "transactions" */ '../views/Transactions'
          )
        : import(/* webpackChunkName: "login" */ '../views/Login'),
  },
  {
    path: '/blocks',
    name: 'blocks',
    component: () =>
      import(/* webpackChunkName: "blocks" */ '../views/Blocks'),
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () =>
      import(/* webpackChunkName: "accounts" */ '../views/Accounts'),
  },
  {
    path: '/blockchains',
    name: 'blockchains',
    component: () =>
      import(/* webpackChunkName: "blockchains" */ '../views/Blockchains'),
  },
];
