<template>
  <div class="flex column">
    <div>{{ data.senderAddress }}</div>
    <div>{{ data.recipientAddress }}</div>
    <div>
      {{
        new Intl.DateTimeFormat('nl-BE', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(data.timestamp))
      }}
    </div>
    <div>{{ data.blockId }}</div>
    <div>{{ data.id }}</div>
    <div v-if="data.amount">{{ integerToDecimal(data.amount) }} CLSK</div>
    <div>{{ integerToDecimal(data.fee) }} CLSK</div>
    <div>{{ data.message || '-' }}</div>
  </div>
</template>

<script>
import { useStore } from 'vuex';

import { _integerToDecimal } from '../../utils';

export default {
  setup() {
    const store = useStore();

    return {
      data: store.state.modal.data,
      integerToDecimal: _integerToDecimal,
    };
  },
};
</script>
