<template>
  <div>
    <textarea v-model="encryptedMessage"></textarea>
    <Button value="Encrypt" @click="encryptMessage" />
    <Button value="Decrypt" @click="decryptMessage" />
    {{ decryptedData }}
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '../Button.vue';

const decryptedData = ref();
const encryptedData = ref();
const key = ref();
const counter = ref();
const encryptedMessage = ref('');

const encoder = (m) => {
  const e = new TextEncoder();
  return e.encode(m);
};

const decoder = (m) => {
  const d = new TextDecoder();
  return d.decode(m);
};

const encryptMessage = async () => {
  // This needs to be 16 characters long?
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
    encoder(encryptedMessage.value),
  );

  console.log(encryptedData.value);
};

const decryptMessage = async () => {
  const decoded = await window.crypto.subtle.decrypt(
    { name: 'AES-CTR', counter: counter.value, length: 64 },
    key.value,
    encryptedData.value,
  );

  console.log(decoder(decoded));

  decryptedData.value = decoder(decoded);

  return decoder(decoded);
};
</script>

<style lang="scss" scoped></style>
