<template>
  <Navbar :title="title" />
  <Section>
    Testing
    <Button value="Generate" @click="generateUrl" />
    <canvas ref="qrCodeRef" />
  </Section>
</template>

<script setup>
import { ref } from 'vue';
import QRCodeGenerator from '@capitalisk/qr-code-generator';

import { _transformMonetaryUnit } from '../utils';

import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Section from '../components/Section';

defineProps({
  title: { type: String, required: true },
});

const qrCodeRef = ref();

const generator = new QRCodeGenerator({
  url: 'http://192.168.1.3:8080/#/transaction/sign',
});

const generateUrl = () => {
  generator.generateSVG(qrCodeRef.value, {
    type: 'transfer',
    recipientAddress: 'clskefecd5cf611f1e3939b3f2754ad7d5b8ecd620a4',
    amount: '1000000000',
    fee: '10000000',
    timestamp: 100000,
    message: `Test QR Generator`,
  });
};
</script>

<style scoped></style>
