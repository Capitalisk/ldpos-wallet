<template>
  <Navbar :title="title" />
  <Wallet v-if="authenticated" />
  <div v-else class="flex flex-wrap flex-gap">
    <Section v-if="!address.data" class="pa-0 fullwidth">
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
                <span v-if="hidden">
                  <i class="fas fa-eye-slash mr-1" />Show
                </span>
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
                @keydown="e => backspace(e, i)"
                @keyup.enter="signin"
                @focus="() => !pasting && (input.value = '')"
                :rules="[
                  val => !!val || (val && val.length <= 0) || 'Required',
                ]"
                :ref="
                  el => {
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
              <span
                class="text-darken cursor-pointer"
                @click="openCustomWallet"
              >
                Provide wallet address
              </span>
              <Tooltip
                class="warning"
                content="If you have changed your passphrase you will have to add you wallet address"
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
        <div class="flex-12 align-center">
          Don't have a {{ token }} wallet yet?
        </div>
        <div class="flex justify-center">
          <!-- TODO: Color danger on invalid -->
          <Button
            :value="
              generatedWalletAddress.loading ? 'Generating...' : 'Create one'
            "
            class="ma-1 outline"
            :class="generatedWalletAddress.loading ? 'warning' : ''"
            @click="generateWallet"
            :loading="generatedWalletAddress.loading"
          />
        </div>
      </Section>
    </Section>
  </div>
</template>

<script>
import { ref, inject, computed, reactive, watch, nextTick } from 'vue';

import { _transformMonetaryUnit } from '../utils.js';
import { TRANSFER_MODAL } from '../components/modals/constants.js';

import Navbar from '../components/Navbar';
import Section from '../components/Section';
import Copy from '../components/Copy';
import Button from '../components/Button';
import Input from '../components/Input';
import Wallet from '../components/Wallet';
import Tooltip from '../components/Tooltip.vue';

export default {
  name: 'Home',
  props: {
    title: { type: String, required: true },
  },
  setup() {
    const store = inject('store');

    const inputs = ref(new Array(12));
    const passphrase = ref('');
    const pasting = ref(false);
    const provideWalletAddress = ref(false);
    const walletAddress = ref(null);

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
      await new Promise(res => setTimeout(() => res(), 100));
      return await new Promise(async (res, rej) => {
        let errors = [];
        for (let i = 0; i < inputRefs.value.length; i++) {
          const v = inputRefs.value[i];
          await v.validate();
          if (v.error) errors.push(v.error);
        }
        if (errors.length)
          rej(new Error('One or more of the field are invalid.'));
        res();
      });
    };

    watch(
      () => inputs.value,
      async n => {
        for (let i = 0; i < n.length; i++) {
          const element = n[i].value;
          const lastInput = document.getElementById(
            `passphrase-${n.length - 1}`,
          );

          if (element && element.split(' ').length === 12) {
            pasting.value = true;

            inputs.value = element.split(' ').map(el => ({ value: el }));

            try {
              await validateAllInputs();
            } catch (e) {}

            lastInput.focus();

            pasting.value = false;
          } else if (element && element.includes(' ')) {
            const nextInput = document.getElementById(`passphrase-${i + 1}`);
            if (nextInput) {
              nextInput.focus();
              nextTick(() => (nextInput.value = ''));
            }
            inputs.value[i].value = inputs.value[i].value.replace(/\s/g, '');
          }
        }

        passphrase.value = n
          .filter(el => el.value !== '')
          .map(el => el.value)
          .join(' ');
      },
      {
        deep: true,
        immediate: false,
      },
    );

    const hidden = ref(true);

    const address = reactive({ loading: true, data: null, error: null });
    const generatedWalletAddress = reactive({
      loading: false,
      data: null,
      error: null,
    });

    const openTransferModal = () => {
      store.toggleOrBrowseModal({ type: TRANSFER_MODAL });
    };

    const generateWallet = async () => {
      generatedWalletAddress.loading = true;
      await new Promise(res => setTimeout(() => res(), 500));
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

    return {
      address: computed(() => address),
      authenticated: computed(() => store.state.authenticated),
      loggingIn: computed(() => store.state.login.loading),
      generateWallet,
      generatedWalletAddress,
      openTransferModal,
      signin: async () => {
        const options = {};

        if (provideWalletAddress.value)
          options.walletAddress = walletAddress.value.trim();

        if (generatedWalletAddress.data)
          await store.authenticate(generatedWalletAddress.data.passphrase);
        else {
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
      },
      openCustomWallet: () =>
        (provideWalletAddress.value = !provideWalletAddress.value),
      provideWalletAddress,
      walletAddress,
      passphrase,
      hidden,
      inputs,
      inputRefs,
      toggleHidden: () => (hidden.value = !hidden.value),
      backspace,
      pasting,
      loading: computed(() => store.state.login.loading),
      error: computed(() => store.state.login.error),
      token: computed(() => store.state.config.networkSymbol.toUpperCase()),
    };
  },
  components: { Section, Copy, Button, Input, Navbar, Wallet, Tooltip, Input },
};
</script>

<style scoped>
.input-number {
  width: 15px;
}
</style>
