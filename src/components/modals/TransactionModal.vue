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
import { computed, inject } from 'vue';
import { _transformMonetaryUnit, _parseDate } from '../../utils';

export default {
  setup() {
    const store = inject('store');

    return {
      data: computed(() => store.state.modal.data),
      unit: computed(() => store.state.config.networkSymbol),
      transformMonetaryUnit: _transformMonetaryUnit,
      parseDate: _parseDate,
    };
  },
};
</script>
