<template>
  <div class="flex flex-gap pa-1 column">
    <div>
      Address:
      <Input v-model="transfer.address.data" :error="transfer.address.error" />
    </div>
    <div>
      Amount:
      <Input
        v-model="transfer.amount.data"
        :error="transfer.amount.error"
        :suffix="unit"
      />
    </div>
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
  <div class="flex justify-center">
    <Button value="Send" @click="send" :loading="loading" />
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

    const loading = ref(false);
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
      loading,
      unit: computed(() => store.state.config.networkSymbol.toUpperCase()),
      send: async () => {
        loading.value = true;

        if (transfer.address.data.length !== 44) {
          transfer.address.error = 'Invalid address';
        }

        for (let i = 0; i < Object.keys(transfer).length; i++) {
          const key = Object.keys(transfer)[i];
          if (!transfer[key].data || !transfer[key].data.length)
            transfer[key].error = 'Required field.';
        }

        const preparedTxn = await store.client.value.prepareTransaction({
          type: 'transfer',
          recipientAddress: transfer.address.data,
          amount: _decimalToInteger(transfer.amount.data),
          fee: _decimalToInteger(transfer.fee.data),
          timestamp: Date.now(),
          message: transfer.message.data,
        });

        await store.client.value.postTransaction(preparedTxn);

        loading.value = false;
      },
    };
  },
  components: { Input, Button },
};
</script>
