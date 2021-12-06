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
    props: {
      title: process.env.IS_ELECTRON ? 'Wallet' : 'Transactions',
    },
  },
  {
    path: '/delegates',
    name: 'delegates',
    component: () =>
      import(/* webpackChunkName: "delegates" */ '../views/Delegates'),
    props: {
      title: 'Delegates',
    },
  },
  {
    path: process.env.IS_ELECTRON ? '/transactions' : '/login',
    name: process.env.IS_ELECTRON ? 'transactions' : 'wallet',
    component: () =>
      process.env.IS_ELECTRON
        ? import(/* webpackChunkName: "transactions" */ '../views/Transactions')
        : import(/* webpackChunkName: "login" */ '../views/Login'),
    props: {
      title: process.env.IS_ELECTRON ? 'Transactions' : 'Wallet',
    },
  },
  {
    path: '/blocks',
    name: 'blocks',
    component: () => import(/* webpackChunkName: "blocks" */ '../views/Blocks'),
    props: {
      title: 'Blocks',
    },
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () =>
      import(/* webpackChunkName: "accounts" */ '../views/Accounts'),
    props: {
      title: 'Accounts',
    },
  },
  {
    path: '/blockchains',
    name: 'blockchains',
    component: () =>
      import(/* webpackChunkName: "blockchains" */ '../views/Blockchains'),
    props: {
      title: 'Blockchains',
    },
  },
];
