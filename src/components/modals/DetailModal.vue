<template>
  <DetailedData :data="data" :prepend-fn="prependFn" />
</template>

<script>
import { computed, inject } from 'vue';

import DetailedData from '../DetailedData';

export default {
  name: 'DetailModal',
  setup() {
    const store = inject('store');

    return {
      data: computed(() => store.state.modal.data),
      prependFn: store.state.modal.prependFn,
    };
  },
  components: { DetailedData },
};
</script>
