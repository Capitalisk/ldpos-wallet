<template>
  <div class="flex justify-center flex-wrap">
    <div class="flex-6 pa-2">
      Passphrase
    </div>
    <div
      @click="toggleHidden"
      class="flex-6 pa-2 text-right cursor-pointer"
      id="show"
    >
      <span v-if="hidden"><i class="fas fa-eye-slash mr-1"></i>Show</span>
      <span v-else><i class="fas fa-eye mr-1"></i>Hide</span>
    </div>
    <div class="login flex flex-wrap flex-gap justify-center pb-2">
      <div v-for="(input, i) in inputs" :key="i" class="flex align-center">
        <div class="input-number">{{ i + 1 }}.</div>
        <div>
          <Input
            class="mx-1"
            v-model="input.value"
            :type="hidden ? 'password' : 'text'"
            :id="`passphrase-${i}`"
            placeholder="__________"
            @keydown="(e) => backspace(e, i)"
            @keyup.enter="signin"
            background-color="primary-darkest"
          />
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
import { computed, inject, onBeforeUpdate, ref, watch, watchEffect } from 'vue';

import router from '../../router';
import Input from './Input';
import Button from './Button';

export default {
  name: 'Login',
  setup() {
    const store = inject('store');

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
      signin: async () => await store.authenticate(passphrase.value),
      backspace,
      loading: computed(() => store.state.login.loading),
      error: computed(() => store.state.login.error),
    };
  },
  components: {
    Button,
    Input,
  },
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
