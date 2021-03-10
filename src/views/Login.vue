<template>
  <div class="login">
    <div class="wrapped-container">
      <div>Sign in with a Passphrase</div>
      <div>Don’t have a Lisk account yet? Create it now</div>
      <div class="login-container">
        <div class="flex-6">
          Passphrase
        </div>
        <div
          @click="toggleHidden"
          class="flex-6 align-content-right cursor-pointer"
        >
          Show
        </div>
        <div class="inputs">
          <p>{{ passphrase }}</p>
          <div v-for="(input, i) in inputs" :key="i">
            <div class="input-number">{{ i + 1 }}.</div>
            <div>
              <input
                class="input"
                v-model="input.value"
                :type="hidden ? 'password' : 'input'"
                :id="`passphrase-${i}`"
                placeholder="__________"
                @keydown="(e) => backspace(e, i)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Button
      value="Sign In"
      @click="signin"
      :loading="signinButtonLoading"
      :error="signinError"
    />
  </div>
</template>

<script>
import router from '../router';
import { computed, onBeforeUpdate, ref, watch, watchEffect } from 'vue';
// import Input from '../components/parts/Input';
import Button from '../components/parts/Button';

import { authenticate } from '../plugins/ldpos-client';

export default {
  name: 'Login',
  setup() {
    const inputs = ref(new Array(12));
    const activeIndex = ref(0);

    for (let i = 0; i < inputs.value.length; i++) {
      inputs.value[i] = { value: '' };
    }

    const passphrase = ref('');
    const hidden = ref(true);
    const signinButtonLoading = ref(false);
    const signinError = ref(null);

    const toggleHidden = () => (hidden.value = !hidden.value);
    const backspace = (e, i) =>
      e.target.value === '' &&
      e.keyCode === 8 &&
      i !== 0 &&
      document.getElementById(`passphrase-${i - 1}`).focus();

    watch(
      () => inputs.value,
      (n) => {
        for (let i = 0; i < n.length; i++) {
          const element = n[i].value;
          const lastInput = document.getElementById(
            `passphrase-${n.length - 1}`,
          );
          if (element.split(' ').length === 12) {
            inputs.value = element.split(' ').map((el) => ({ value: el }));
            lastInput.focus();
          } else if (element.includes(' ')) {
            const nextInput = document.getElementById(`passphrase-${i + 1}`);
            nextInput.focus();
          }
        }

        passphrase.value = n.map((el) => el.value).join(' ');
      },
      {
        deep: true,
        immediate: false,
      },
    );

    const signin = async () => {
      try {
        signinButtonLoading.value = true;
        const { walletConnected } = await authenticate(passphrase.value);
        if (walletConnected) router.push('/');
      } catch (e) {
        signinError.value = e.message;
      }
      signinButtonLoading.value = false;
    };

    return {
      passphrase,
      hidden,
      inputs,
      toggleHidden,
      signin,
      backspace,
      signinButtonLoading,
      signinError,
    };
  },
  components: {
    Button,
    // Input,
  },
};
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 95vh;
  width: 100%;
}

.wrapped-container {
  width: 75%;
}

.login-container {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.flex-6 {
  flex-grow: 6;
  flex-basis: 40%;
  padding: 1rem;
}

.align-content-right {
  text-align: right;
}

.inputs {
  display: flex;
  flex-wrap: wrap;
}

.inputs > div {
  display: flex;
  align-items: center;
}

.input-number {
  width: 15px;
}

/* BUTTON */

.input {
  background-color: var(--primary);
  border: 0;
  padding: 0.75rem;
  margin: 0.5rem;
  color: var(--white);
  border-radius: var(--border-radius);
  text-decoration: none;
}

.input::placeholder {
  color: var(--white);
}
</style>
