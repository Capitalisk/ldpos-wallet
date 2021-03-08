<template>
  <NavBar />
  <AccountDetails />
</template>

<script>
import AccountDetails from '../components/sections/AccountDetails';
import NavBar from '../components/sections/NavBar';

export default {
  name: 'Home',
  components: { AccountDetails, NavBar },
};
</script>
