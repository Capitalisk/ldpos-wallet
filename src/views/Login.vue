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
          <div class="column is-12">{{ inputs.map((i) => i.value) }}</div>
          <div v-for="(input, i) in inputs" :key="i">
            <div class="input-number">{{ i + 1 }}.</div>
            <div>
              {{ input.value }}
              <!-- <input
                class="input"
                v-model="input.value"
                :hidden="hidden"
                :id="`passphrase-${i}`"
                placeholder="__________"
              /> -->
              <input
                class="input"
                v-model="input.value"
                :type="hidden ? 'password' : 'input'"
                placeholder="__________"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Button value="Sign In" />
  </div>
</template>

<script>
import { computed, onBeforeUpdate, ref, watch } from 'vue';
// import Input from '../components/parts/Input';
import Button from '../components/parts/Button';

export default {
  name: 'Login',
  setup() {
    const inputs = ref(new Array(12));

    for (let i = 0; i < inputs.value.length; i++) {
      inputs.value[i] = { value: '' };
    }

    const passphrase = ref('');
    const hidden = ref(true);

    const toggleHidden = () => (hidden.value = !hidden.value);

    watch(
      () => inputs.value.map((v) => v.value).join(' '),
      (n) => {
        inputs.value = n
          .split(' ')
          .filter((e) => e !== '')
          .map((value) => (value = { value }))
          .slice(0, 12);

        passphrase.value = n;
      },
    );

    return {
      passphrase,
      hidden,
      inputs,
      toggleHidden,
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
