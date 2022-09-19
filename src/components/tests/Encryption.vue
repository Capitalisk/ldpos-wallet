<template>
  <div>
    <Button value="Encrypt" @click="encryptMessage" />
    <Button value="Decrypt" @click="decryptMessage" />
    {{ encryptedMessage }}
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '../Button.vue';

const encryptedMessage = ref();
const encryptedData = ref();
const key = ref();
const counter = ref();

const encoder = (m) => {
  const e = new TextEncoder();
  return e.encode(m);
};

const decoder = (m) => {
  const d = new TextDecoder();
  return d.decode(m);
};

const encryptMessage = async () => {
  const k = encoder('sadjoiasjdosaijd');
  console.debug(k);

  key.value = await window.crypto.subtle.importKey(
    'raw', //can be "jwk" or "raw"
    k,
    {
      //this is the algorithm options
      name: 'AES-CTR',
    },
    false, //whether the key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt'], //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
  );

  console.debug(key.value);

  counter.value = window.crypto.getRandomValues(new Uint8Array(16));

  encryptedData.value = await window.crypto.subtle.encrypt(
    {
      name: 'AES-CTR',
      counter: counter.value,
      length: 64,
    },
    key.value,
    encoder(JSON.stringify({ test: true })),
  );

  console.log(encryptedData.value);
};

const decryptMessage = async () => {
  const decoded = new Uint8Array(
    new Uint8Array(
      await window.crypto.subtle.decrypt(
        { name: 'AES-CTR', counter: counter.value, length: 64 },
        key.value,
        encryptedData.value,
      ),
    ),
  );

  console.log(JSON.parse(decoder(decoded)));

  return JSON.parse(decoder(decoded));
};
</script>

<style lang="scss" scoped></style>
