<template>
  <DetailedData :data="data" />
</template>

<script>
import { computed, inject } from "vue";

import DetailedData from "../DetailedData";

import { _transformMonetaryUnit, _parseDate } from "../../utils";

export default {
  name: "DetailModal",
  setup() {
    const store = inject("store");

    return {
      data: computed(() => store.state.modal.data),
      unit: computed(() => store.state.config.networkSymbol),
      transformMonetaryUnit: _transformMonetaryUnit,
      parseDate: _parseDate,
    };
  },
  components: { DetailedData },
};
</script>
