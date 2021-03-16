<template>
  <div class="login">
    <div class="wrapped-container">
      <div>Sign in with a Passphrase</div>
      <div>Don’t have an account yet? Create it now</div>
      <div class="login-container">
        <div class="flex-6">
          Passphrase
        </div>
        <div
          @click="toggleHidden"
          class="flex-6 align-content-right cursor-pointer"
          id="show"
        >
          Show
        </div>
        <div class="inputs">
          <div v-for="(input, i) in inputs" :key="i">
            <div class="input-number">{{ i + 1 }}.</div>
            <div>
              <input
                class="input"
                v-model="input.value"
                :type="hidden ? 'password' : 'text'"
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
      :value="loading ? 'Hang in there...' : 'Sign In'"
      @click="signin"
      :loading="loading"
      :error="error"
      :backgroundColor="loading ? 'warning' : 'primary-lightest'"
    />
  </div>
</template>

<script>
import { computed, onBeforeUpdate, ref, watch, watchEffect } from 'vue';
import { useStore } from 'vuex';

import router from '../router';
// import Input from '../components/parts/Input';
import Button from '../components/parts/Button';

export default {
  name: 'Login',
  setup() {
    const store = useStore();

    const inputs = ref(new Array(12));
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

    watch(
      () => inputs.value,
      (n) => {
        for (let i = 0; i < n.length; i++) {
          const element = n[i].value;
          const lastInput = document.getElementById(
            `passphrase-${n.length - 1}`,
          );

          if (element && element.split(' ').length === 12) {
            inputs.value = element.split(' ').map((el) => ({ value: el }));
            lastInput.focus();
          } else if (element && element.includes(' ')) {
            const nextInput = document.getElementById(`passphrase-${i + 1}`);
            nextInput.focus();
            inputs.value[i].value = inputs.value[i].value.replace(/\s/g, '');
          }
        }

        passphrase.value = n.map((el) => el.value).join(' ');
      },
      {
        deep: true,
        immediate: false,
      },
    );

    const hidden = ref(true);

    return {
      passphrase,
      hidden,
      inputs,
      toggleHidden: () => (hidden.value = !hidden.value),
      signin: async () => await store.commit('authenticate', passphrase.value),
      backspace,
      loading: computed(() => store.state.login.loading),
      error: computed(() => store.state.login.error),
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
