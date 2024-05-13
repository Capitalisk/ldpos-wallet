<template>
  <Navbar v-if="route.query.type === 'request'" :title="title + ' (Receive)'" />
  <Navbar v-else :title="title" />
  <Section>
    <TransferForm v-model="transfer" />

    <Button v-if="route.query.type === 'request'" value="Generate" @click="generateUrl" />
    <Button
      v-else
      value="Send"
      @click="sendTransaction"
      :loading="loading"
      :class="error ? 'danger' : ''"
    />
    <div class="col-6 flex justify-center">
      <img ref="qrCodeRef" />
    </div>
  </Section>
</template>

<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import QRCodeGenerator from '@capitalisk/qr-code-generator';

import {
  _integerToDecimal,
  _decimalToInteger,
  _transformMonetaryUnit
} from '../utils';

import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Section from '../components/Section';
import TransferForm from '../components/forms/TransferForm';

defineProps({
  title: { type: String, required: true },
});

const router = useRouter();
const route = useRoute();
const store = inject('store');

const darkMode = computed(() => store.state.darkMode);

const { query } = route;

const loading = ref(false);
const error = ref(false);

const transfer = ref({
  address: query.recipientAddress || '',
  amount: query.amount ? _integerToDecimal(query.amount) : '',
  fee: query.fee ? _integerToDecimal(query.fee) : '',
  message: query.message || '',
});

const qrCodeRef = ref();

const generator = new QRCodeGenerator();

const generateUrl = async () => {
  const preparedTxn = {
    type: 'transfer',
    recipientAddress: transfer.value.address,
    amount: _decimalToInteger(transfer.value.amount),
    fee: _decimalToInteger(transfer.value.fee),
    message: transfer.value.message,
  };

  const base64 = await generator.generateBase64Image(preparedTxn, {
    color: {
      dark: darkMode.value ? '#FFFFFF' : '#161A22',
      light: darkMode.value ? '#161A22' : '#FFFFFF',
    },
  });
  qrCodeRef.value.src = base64;
};

const sendTransaction = async () => {
  loading.value = true;
  error.value = false;
  try {
    if (!store.state.authenticated) {
      await store.attemptReauthenticate();
    }
    const preparedTxn = await store.client.value.prepareTransaction({
      type: 'transfer',
      recipientAddress: transfer.value.address,
      amount: _decimalToInteger(transfer.value.amount),
      fee: _decimalToInteger(transfer.value.fee),
      timestamp: Date.now(),
      message: transfer.value.message,
    });

    await store.client.value.postTransaction(preparedTxn);

    store.notify(
      { message: `Transaction sent to ${transfer.value.address}` },
      5,
    );
    router.push({ name: 'wallet' });

  } catch (e) {
    store.notify({ message: `Error: ${e.message}`, error: true }, 5);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

watchEffect(
  () =>
    (darkMode.value || !darkMode.value) &&
    qrCodeRef.value &&
    qrCodeRef.value.src &&
    generateUrl(),
);
</script>

<style scoped></style>
