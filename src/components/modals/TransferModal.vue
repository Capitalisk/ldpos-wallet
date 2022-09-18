<template>
  <TransferForm v-model="transfer" ref="transferRef" verify-transfer-limit />
  <div class="flex justify-center">
    <Button
      value="Send"
      @click="send"
      :loading="loading"
      :class="error ? 'danger' : ''"
    />
  </div>
</template>

<script setup>
import { inject, ref } from 'vue';

import {
  _decimalToInteger,
  _integerToDecimal,
  _transformMonetaryUnit,
} from '../../utils';

import Button from '../Button';
import TransferForm from '../forms/TransferForm.vue';

const store = inject('store');

const loading = ref(false);
const error = ref(false);

const transfer = ref({
  address: '',
  amount: '',
  fee: '',
  message: '',
});

const transferRef = ref();

const send = async () => {
  loading.value = true;
  error.value = false;

  // TODO: Improve to one call, and one hasError boolean
  await transferRef.value.validate();
  if (transferRef.value.hasError) {
    loading.value = false;
    error.value = true;
    return;
  }

  try {
    const preparedTxn = await store.client.value.prepareTransaction({
      type: 'transfer',
      recipientAddress: transfer.value.address,
      amount: _decimalToInteger(transfer.value.amount),
      fee: _decimalToInteger(transfer.value.fee),
      timestamp: Date.now(),
      message: transfer.value.message,
    });

    await store.client.value.postTransaction(preparedTxn);

    window.dispatchEvent(new Event('DataTable:update'));

    store.notify(
      { message: `Transaction sent to ${transfer.value.address}` },
      5,
    );
  } catch (e) {
    store.notify({ message: `Error: ${e.message}`, error: true }, 5);
    error.value = true;
    return;
  } finally {
    loading.value = false;
    store.toggleOrBrowseModal();
  }
};
</script>

<style scoped>
.amount {
  color: var(--primary-lighter);
}
</style>
