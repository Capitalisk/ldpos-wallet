<template>
  <Navbar />
  <DataTable />
</template>

<script>
import Navbar from '../components/parts/Navbar.vue';
import DataTable from '../components/parts/DataTable.vue';

export default {
  name: 'Transactions',
  setup() {},
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
