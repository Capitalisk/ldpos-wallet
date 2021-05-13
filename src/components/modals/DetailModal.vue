<template>
  <DetailedData :data="data" />
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
    };
  },
  components: { DetailedData },
};
</script>
