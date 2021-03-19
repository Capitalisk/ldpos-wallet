<template>
  <div>{{ data }}</div>
</template>

<script>
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();

    return {
      data: store.state.modal.data,
    };
  },
};
</script>
