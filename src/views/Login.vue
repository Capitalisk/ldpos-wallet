<template>
  <Navbar />
  <Wallet v-if="authenticated" />
  <div v-else class="flex flex-wrap flex-gap">
    <Section
      v-if="!address.data"
      title="Sign in to your wallet"
      class="flex-12"
    >
      <span class="text-error" v-if="generatedWalletAddress.error">
        {{ generatedWalletAddress.error }}
      </span>
      <span v-else-if="generatedWalletAddress.data">
        <p class="text-error pb-2">
          <strong>IMPORTANT:</strong><br />
          Write this down in a safe place!<br />
          Losing the passphrase is losing its assets as well!
        </p>
        <strong>Address</strong>
        <Copy :value="generatedWalletAddress.data.address" /><br />
        <strong>Passphrase</strong>
        <Copy :value="generatedWalletAddress.data.passphrase" />
      </span>
      <div
        v-if="!generatedWalletAddress.data"
        class="flex justify-center flex-wrap"
      >
        <div class="login flex flex-wrap flex-gap justify-center pb-2">
          <div class="flex-6 pa-2">Passphrase</div>
          <div
            @click="toggleHidden"
            class="flex-6 pa-2 text-right cursor-pointer"
            id="show"
          >
            <span v-if="hidden"><i class="fas fa-eye-slash mr-1"></i>Show</span>
            <span v-else><i class="fas fa-eye mr-1"></i>Hide</span>
          </div>
          <div v-for="(input, i) in inputs" :key="i" class="flex align-center">
            <div class="input-number">{{ i + 1 }}.</div>
            <div>
              <Input
                class="mx-1 text-center primary-darkest"
                v-model="input.value"
                :type="hidden ? 'password' : 'text'"
                :id="`passphrase-${i}`"
                placeholder="__________"
                @keydown="e => backspace(e, i)"
                @keyup.enter="signin"
                :rules="[
                  val => !!val || (val && val.length <= 0) || 'Required',
                ]"
                :ref="
                  el => {
                    if (el) inputRefs[i] = el;
                  }
                "
              />
            </div>
          </div>
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
    </Section>
    <Section v-if="!generatedWalletAddress.data" title="" class="flex-12">
      <div>
        <div class="flex justify-center">
          Don't have a {{ token }} wallet yet?
        </div>
        <div class="flex justify-center">
          <Button
            :value="
              generatedWalletAddress.loading ? 'Generating...' : 'Create one'
            "
            class="ma-1"
            :class="generatedWalletAddress.loading ? 'warning' : ''"
            @click="generateWallet"
            :loading="generatedWalletAddress.loading"
          />
        </div>
      </div>
    </Section>
  </div>
</template>

<script>
import { ref, inject, computed, reactive, watch, onMounted } from 'vue';

import { _transformMonetaryUnit } from '../utils.js';

import Navbar from '../components/Navbar';
import Section from '../components/Section';
import Copy from '../components/Copy';
import Button from '../components/Button';
import Input from '../components/Input';
import Wallet from '../components/Wallet';
import { TRANSFER_MODAL } from '../components/modals/constants.js';

export default {
  name: 'Home',
  setup() {
    const store = inject('store');

    const inputs = ref(new Array(12));
    const inputRefs = ref([]);
    const activeIndex = ref(0);
    const passphrase = ref('');

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
            inputs.value = element.split(' ').map(el => ({ value: el }));

            try {
              await validateAllInputs();
            } catch (e) {}

            lastInput.focus();
          } else if (element && element.includes(' ')) {
            const nextInput = document.getElementById(`passphrase-${i + 1}`);
            if (nextInput) {
              nextInput.focus();
            }
            inputs.value[i].value = inputs.value[i].value.replace(/\s/g, '');
          }
        }

        passphrase.value = n.map(el => el.value).join(' ');
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
      store.toggleModal({ type: TRANSFER_MODAL });
    };

    const generateWallet = async () => {
      generatedWalletAddress.loading = true;
      await new Promise(res => setTimeout(() => res(), 500));
      try {
        if (!generatedWalletAddress.data)
          generatedWalletAddress.data = await store.client.value.generateWallet();
        else return;
      } catch (e) {
        console.log(e);
        generatedWalletAddress.error = e.message;
      }
      generatedWalletAddress.loading = false;
    };

    return {
      address: computed(() => address),
      authenticated: computed(() => store.state.authenticated),
      loggingIn: computed(() => store.state.login.loading),
      generateWallet,
      generatedWalletAddress,
      openTransferModal,
      signin: async () => {
        if (generatedWalletAddress.data)
          await store.authenticate(generatedWalletAddress.data.passphrase);
        else {
          try {
            await validateAllInputs();
            await store.authenticate(passphrase.value);
          } catch (e) {
            store.notify({ message: `Error: ${e.message}`, error: true }, 5);
            console.error(e);
          }
        }
      },
      passphrase,
      hidden,
      inputs,
      inputRefs,
      toggleHidden: () => (hidden.value = !hidden.value),
      backspace,
      loading: computed(() => store.state.login.loading),
      error: computed(() => store.state.login.error),
      token: computed(() => store.state.config.networkSymbol.toUpperCase()),
    };
  },
  components: { Section, Copy, Button, Input, Navbar, Wallet },
  // mounted() {
  //   this.$forceUpdate();
  // },
};
</script>

<style scoped>
.login {
  max-width: 980px;
}

.input-number {
  width: 15px;
}
</style>
