<template>
  <div class="flex justify-center mt-2">
    <h4>Sign in to your wallet</h4>
  </div>
  <div class="flex justify-center">
    <h5>Use your passphrase to login to your wallet</h5>
  </div>
  <div class="flex-12 pa-2">
    <span class="text-danger" v-if="generatedWalletAddress.error">
      {{ generatedWalletAddress.error }}
    </span>
    <span v-else-if="generatedWalletAddress.data">
      <div class="notification-warning mb-2">
        <strong>IMPORTANT</strong><br />
        Write this down in a safe place!<br />
        Losing the passphrase is losing its assets as well!
      </div>
      <strong>Address</strong>
      <Copy :value="generatedWalletAddress.data.address" /><br />
      <strong>Passphrase</strong>
      <Copy :value="generatedWalletAddress.data.passphrase" />
    </span>
    <div
      v-if="!generatedWalletAddress.data"
      class="flex justify-center flex-wrap"
    >
      <div class="flex flex-wrap justify-center">
        <div class="flex-12 pa-2 text-right" id="show">
          <span @click="toggleHidden" class="cursor-pointer">
            <span v-if="hidden"> <i class="fas fa-eye-slash mr-1" />Show </span>
            <span v-else><i class="fas fa-eye mr-1" />Hide</span>
          </span>
        </div>
        <div
          v-for="(input, i) in inputs"
          :key="i"
          class="flex align-center pb-2"
        >
          <Input
            :prefix="i + 1"
            class="mx-1 text-center primary-darker"
            v-model="input.value"
            :type="hidden ? 'password' : 'text'"
            :id="`passphrase-${i}`"
            placeholder="__________"
            @keydown="(e) => backspace(e, i)"
            @keyup.enter="signin"
            @focus="() => (input.value = '')"
            :rules="[(val) => pasting || !!val || (val && val.length <= 0) || 'Required']"
            :ref="
              (el) => {
                if (el) inputRefs[i] = el;
              }
            "
            hide-validation
          />
        </div>
      </div>
      <div class="flex column flex-12">
        <div class="pa-1 text-center">
          <i
            v-if="provideWalletAddress"
            class="text-darken fa fa-angle-up cursor-pointer pr-1"
            @click="openCustomWallet"
          />
          <i
            v-else
            class="text-darken fa fa-angle-down cursor-pointer pr-1"
            @click="openCustomWallet"
          />
          <span class="text-darken cursor-pointer" @click="openCustomWallet">
            Provide wallet address
          </span>
          <Tooltip
            class="warning"
            content="If you have changed your passphrase you will have to add your wallet address"
            icon-class="text-darken ml-1"
          />
        </div>
        <Transition name="slide-fade">
          <div v-if="provideWalletAddress">
            <Input
              placeholder="Wallet address"
              class="mx-1 primary-darker"
              v-model="walletAddress"
            />
          </div>
        </Transition>
      </div>
    </div>
    <div class="flex column">
      <div class="flex justify-center">
        <Button
          :value="loggingIn ? 'Hang in there...' : 'Sign in'"
          class="ma-2"
          :class="loggingIn ? 'warning' : ''"
          @click="signin"
          :loading="loggingIn"
        />
      </div>
    </div>
  </div>
  <Section
    v-if="!generatedWalletAddress.data"
    class="flex bg-primary-darker justify-center pa-4"
  >
    <div class="flex-12 align-center">Don't have a {{ token }} wallet yet?</div>
    <div class="flex justify-center">
      <!-- TODO: Color danger on invalid -->
      <Button
        :value="generatedWalletAddress.loading ? 'Generating...' : 'Create one'"
        class="ma-1 outline"
        :class="generatedWalletAddress.loading ? 'warning' : ''"
        @click="generateWallet"
        :loading="generatedWalletAddress.loading"
      />
    </div>
  </Section>
</template>

<script setup>
import { computed, inject, reactive, ref, watch, nextTick } from 'vue';

import Button from '../Button';
import Tooltip from '../Tooltip';
import Input from '../Input';
import Copy from '../Copy';
import Section from '../Section';

const store = inject('store');

const inputs = ref(new Array(12));
const passphrase = ref('');
const provideWalletAddress = ref(false);
const walletAddress = ref(null);

const pasting = ref(false);

const inputRefs = ref([]);

for (let i = 0; i < inputs.value.length; i++) {
  inputs.value[i] = { value: '' };
}

const backspace = (e, i) =>
  e.target.value === '' &&
  e.keyCode === 8 &&
  i !== 0 &&
  document.getElementById(`passphrase-${i - 1}`).focus();

const validateAllInputs = async () => {
  await new Promise((res) => nextTick(() => res()));
  return await new Promise(async (res, rej) => {
    let errors = [];
    for (let i = 0; i < inputRefs.value.length; i++) {
      const v = inputRefs.value[i];
      await v.validate();
      if (v.error) errors.push(v.error);
    }
    if (errors.length) rej(new Error('One or more fields are invalid.'));
    res();
  });
};

watch(
  () => inputs.value,
  async (n) => {
    const hasMultiWords = n.map((el) => el.value).some((word) => word.indexOf(' ') !== -1);
    if (!hasMultiWords) {
      pasting.value = false;
      if (n.filter((element) => !!element.value).length === 12) {
        await validateAllInputs();
      }
      return;
    };
    pasting.value = true;

    const newValues = [];
    let i = 0;
    let newTabIndex;
    while (i < n.length) {
      const element = n[i].value;
      const splitWords = element.split(' ');
      for (let word of splitWords) {
        newValues.push(word);
      }
      if (splitWords.length > 1) {
        newTabIndex = i + splitWords.length + (splitWords[1] ? 0 : -1);
      }
      i += splitWords.length || 1;
    }
    newTabIndex = Math.min(newTabIndex, 12);
    newValues.splice(12);

    inputs.value = newValues.map((el) => ({ value: el }));

    await new Promise((resolve) => nextTick(resolve));

    if (newTabIndex != null && newTabIndex < 12) {
      document.getElementById(`passphrase-${newTabIndex}`).focus();
    }
  },
  {
    deep: true,
    immediate: false,
  },
);

watch(
  () => store.state.authenticated,
  () => {
    generatedWalletAddress.loading = false;
    generatedWalletAddress.data = null;
    generatedWalletAddress.error = null;
    walletAddress.value = null;
    provideWalletAddress.value = false;
  },
);

const hidden = ref(true);

const loggingIn = computed(() => store.state.login.loading);
const signin = async () => {
  const options = {};

  passphrase.value = inputs.value.map((el) => el.value).join(' ');

  if (provideWalletAddress.value && walletAddress.value)
    options.walletAddress = walletAddress.value.trim();

  if (generatedWalletAddress.data) {
    try {
      await store.authenticate(generatedWalletAddress.data.passphrase);
    } catch (e) {
      store.notify({ message: `Error: ${e.message}`, error: true }, 5);
      console.error(e);
    }
  } else {
    try {
      await validateAllInputs();
      await store.authenticate(passphrase.value, options);
    } catch (e) {
      store.notify({ message: `Error: ${e.message}`, error: true }, 5);
      console.error(e);
    }
    for (let i = 0; i < inputs.value.length; i++) {
      inputs.value[i] = { value: '' };
    }
  }
  if (store.state.authenticated) {
    let credentials = {
      passphrase: passphrase.value
    };
    if (options.walletAddress) {
      credentials.walletAddress = options.walletAddress;
    }
    localStorage.setItem('ldpos-credentials', btoa(JSON.stringify(credentials)));
  }
};

const generateWallet = async () => {
  generatedWalletAddress.loading = true;
  await new Promise((res) => setTimeout(() => res(), 500));
  try {
    if (!generatedWalletAddress.data)
      generatedWalletAddress.data = await store.client.value.generateWallet();
    else return;
  } catch (e) {
    console.error(e);
    generatedWalletAddress.error = e.message;
  }
  generatedWalletAddress.loading = false;
};

const generatedWalletAddress = reactive({
  loading: false,
  data: null,
  error: null,
});

const openCustomWallet = () =>
  (provideWalletAddress.value = !provideWalletAddress.value);
const toggleHidden = () => (hidden.value = !hidden.value);
const token = computed(() => store.state.config.networkSymbol.toUpperCase());

async function recoverAuthentication() {
  try {
    await store.attemptReauthenticate();
  } catch (e) {}
}

recoverAuthentication();
</script>

<style lang="scss" scoped></style>
