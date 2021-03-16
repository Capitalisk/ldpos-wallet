<template>
  <div class="table flex">
    <div class="loading">

    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'DataTable',
  setup() {
    const store = useStore();

    return {};
  },
};
</script>

<style scoped>
.table {
  border-radius: var(--border-radius);
}
</style>
