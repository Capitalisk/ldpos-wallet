<template>
  <Navbar :title="title" />
  <Section>
    <TransferForm v-model="transfer" />
    <Button value="Generate" @click="generateUrl" />
    <div class="col-6 flex justify-center">
      <img ref="qrCodeRef" />
    </div>
  </Section>
</template>

<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import QRCodeGenerator from '@capitalisk/qr-code-generator';

import { _decimalToInteger, _transformMonetaryUnit } from '../utils';

import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Section from '../components/Section';
import TransferForm from '../components/forms/TransferForm';

defineProps({
  title: { type: String, required: true },
});

const store = inject('store');

const darkMode = computed(() => store.state.darkMode);

const transfer = ref({
  address: '',
  amount: '',
  fee: '',
  message: '',
});

const qrCodeRef = ref();

const generator = new QRCodeGenerator({
  url: 'http://192.168.1.3:8080/#/transaction/sign',
});

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

watchEffect(
  () =>
    (darkMode.value || !darkMode.value) &&
    qrCodeRef.value &&
    qrCodeRef.value.src &&
    generateUrl(),
);
</script>

<style scoped></style>
