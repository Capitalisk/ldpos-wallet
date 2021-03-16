<template>
  <Navbar />
  <AccountDetails />
</template>

<script>
import AccountDetails from '../components/sections/AccountDetails';
import Navbar from '../components/sections/Navbar';

export default {
  name: 'Home',
  components: { AccountDetails, Navbar },
};
</script>
