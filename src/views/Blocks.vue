<template>
  <Navbar />
  <DataTable
    :columns="columns"
    title="All blocks in the chain"
    clickable
    fn="getBlocksByTimestamp"
  />
</template>

<script>
import { computed, inject, onMounted, ref } from "vue";

import Navbar from "../components/Navbar.vue";
import DataTable from "../components/DataTable.vue";
import { _integerToDecimal, _parseDate } from "../utils";
import { DETAIL_MODAL } from "../components/modals/constants";

export default {
  name: "Blocks",
  setup() {
    const columns = ref([
      // { name: 'type', label: 'type', field: 'type', sortable: false },
      {
        name: "height",
        label: "Height",
        field: "height",
        sortable: false,
        active: true,
      },
      {
        name: "timestamp",
        label: "Date",
        field: "timestamp",
        sortable: true,
        value: (val) => _parseDate(val),
        active: true,
        sorted: "desc",
      },
      {
        name: "numberOfTransactions",
        label: "Transactions",
        field: "numberOfTransactions",
        sortable: false,
        active: true,
      },
      {
        name: "forgerAddress",
        label: "Forger",
        field: "forgerAddress",
        sortable: false,
        class: "address",
        active: true,
      },
    ]);

    return {
      columns,
    };
  },
  components: { DataTable, Navbar },
};
</script>

<style scoped></style>
