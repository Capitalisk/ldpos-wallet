<template>
  <div class="flex flex-gap pa-1 column">
    <div>
      Address:
      <Input
        v-model="transfer.address.data"
        :rules="[
          val => !val || val.length > 0 || 'Required',
          val => (val && val.length === 44) || 'Invalid address',
        ]"
        :ref="el => (transfer.address.ref = el)"
      />
    </div>
    <div>
      Amount:<br />
      <small @click="populate" class="cursor-pointer"
        >Max: {{ transformMonetaryUnit(decimalToInteger(maxBalance)) }}</small
      >
      <Input
        v-model="transfer.amount.data"
        :error="transfer.amount.error"
        :suffix="unit"
        :ref="el => (transfer.amount.ref = el)"
        :rules="[
          val => !val || val.length > 0 || 'Required',
          val =>
            (val && Number.isInteger(parseInt(decimalToInteger(val)))) ||
            'Not a valid amount',
          val =>
            parseFloat(val) <= parseFloat(maxBalance) ||
            'You are trying to transfer more than you have',
        ]"
      />
    </div>
    <div>
      Fee:
      <Input
        v-model="transfer.fee.data"
        :error="transfer.fee.error"
        :suffix="unit"
        disabled
        :ref="el => (transfer.fee.ref = el)"
      />
    </div>
    <div>
      Message:
      <Input
        v-model="transfer.message.data"
        :error="transfer.message.error"
        :ref="el => (transfer.message.ref = el)"
      />
    </div>
  </div>
  <div class="flex justify-center">
    <Button
      value="Send"
      @click="send"
      :loading="loading"
      :class="error ? 'danger' : ''"
    />
  </div>
</template>

<script>
import { reactive, inject, onMounted, computed, ref } from 'vue';

import {
  _decimalToInteger,
  _integerToDecimal,
  _transformMonetaryUnit,
} from '../../utils';

import Input from '../Input';
import Button from '../Button';

export default {
  name: 'TransferModal',
  setup() {
    const store = inject('store');

    const loading = ref(false);
    const error = ref(false);
    const maxBalance = ref(null);
    const transfer = reactive({
      address: {
        ref: null,
        data: null,
      },
      amount: {
        ref: null,
        data: null,
      },
      fee: {
        ref: null,
        data: null,
      },
      message: {
        ref: null,
        data: '',
      },
    });

    onMounted(async () => {
      const { minTransactionFees } = await store.client.value.getMinFees();
      transfer.fee.data = _integerToDecimal(minTransactionFees.transfer);

      const address = await store.client.value.getWalletAddress();

      const { balance } = await store.client.value.getAccount(address);

      maxBalance.value = _integerToDecimal(
        balance - minTransactionFees.transfer,
      );
    });

    return {
      transfer,
      loading,
      error,
      maxBalance,
      unit: computed(() => store.state.config.networkSymbol.toUpperCase()),
      populate: () => (transfer.amount.data = maxBalance.value),
      send: async () => {
        loading.value = true;
        error.value = false;

        await transfer.address.ref.validate();
        await transfer.amount.ref.validate();
        await transfer.fee.ref.validate();
        await transfer.message.ref.validate();

        try {
          for (let i = 0; i < Object.keys(transfer).length; i++) {
            const key = Object.keys(transfer)[i];
            if (transfer[key].ref.error)
              throw new Error(transfer[key].ref.error);
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
        } catch (e) {
          store.notify({ message: `Error: ${e.message}`, error: true }, 5);
          error.value = true;
          loading.value = false;
          return;
        }
        store.notify(
          { message: `Transaction sent to ${transfer.address.data}` },
          5,
        );
        loading.value = false;

        store.toggleModal();
      },
      decimalToInteger: _decimalToInteger,
      transformMonetaryUnit: _transformMonetaryUnit,
    };
  },
  components: { Input, Button },
};
</script>
