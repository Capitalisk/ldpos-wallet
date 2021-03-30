<template>
  <div class="flex flex-gap pa-1 column">
      Address:
      <Input v-model="transfer.address.data" :error="transfer.address.error" />
      Amount:
      <Input
        v-model="transfer.amount.data"
        :error="transfer.amount.error"
        :suffix="unit"
      />
    <div>
      Fee:
      <Input
        v-model="transfer.fee.data"
        :error="transfer.fee.error"
        :suffix="unit"
        disabled
      />
    </div>
    <div>
      Message:
      <Input v-model="transfer.message.data" :error="transfer.message.error" />
    </div>
  </div>
  <div v-if="error" class="text-error">{{ error }}</div>
  <div class="flex justify-center">
    <Button
      value="Send"
      @click="send"
      :background-color="error ? 'danger' : 'primary-lighter'"
    />
  </div>
</template>

<script>
import { reactive, inject, onMounted, computed, ref } from 'vue';

import { _decimalToInteger, _integerToDecimal } from '../../utils';

import Input from '../parts/Input';
import Button from '../parts/Button';

export default {
  name: 'TransferModal',
  setup() {
    const store = inject('store');

    const error = ref(null);
    const transfer = reactive({
      address: {
        error: null,
        data: null,
      },
      amount: {
        error: null,
        data: null,
      },
      fee: {
        error: null,
        data: null,
      },
      message: {
        error: null,
        data: '',
      },
    });

    onMounted(async () => {
      const { minTransactionFees } = await store.client.value.getMinFees();
      transfer.fee.data = _integerToDecimal(minTransactionFees.transfer);
    });

    return {
      transfer,
      error,
      unit: computed(() => store.state.config.networkSymbol.toUpperCase()),
      send: async () => {
        error.value = null;
        const transferData = {
          address: transfer.address.data,
          amount: _decimalToInteger(transfer.amount.data) || 0,
          fee: _decimalToInteger(transfer.fee.data),
          message: transfer.message.data,
        };

        if (transfer.address.length !== 44) {
          transfer.address.error = 'Invalid address';
          return;
        }
        console.log(transfer);
      },
    };
  },
  components: { Input, Button },
};
</script>

<style scoped></style>
