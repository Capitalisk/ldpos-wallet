<template>
  <div class="flex column">
    <div>{{ data.senderAddress }}</div>
    <div>{{ data.recipientAddress }}</div>
    <div>
      {{ parseDate(data.timestamp) }}
    </div>
    <div>{{ data.blockId }}</div>
    <div>{{ data.id }}</div>
    <div v-if="data.amount">{{ transformMonetaryUnit(data.amount, unit) }}</div>
    <div>{{ transformMonetaryUnit(data.amount, unit) }} CLSK</div>
    <div>{{ data.message || '-' }}</div>
  </div>
</template>

<script>
import { useStore } from 'vuex';

import { _transformMonetaryUnit, _parseDate } from '../../utils';

export default {
  setup() {
    const store = useStore();

    return {
      data: store.state.modal.data,
      transformMonetaryUnit: _transformMonetaryUnit,
      parseDate: _parseDate,
      unit: store.state.config.networkSymbol,
    };
  },
};
</script>
