<template>
  <p>{{ rows }}</p>
  <!-- <p>{{ columns }}</p> -->
</template>

<script>
import { computed } from '@vue/runtime-core';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();

    return {
      rows: computed(() => store.state.modal.data),
      // columns: computed(() => store.state.modal.data.columns),
    };
  },
};
</script>
