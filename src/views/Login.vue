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
          {{ passphrase }}
          <div v-for="(part, i) in inputs" :key="i">
            <div class="input-number">{{ i + 1 }}.</div>
            <div>
              <Input
                class="input"
                v-model="part.value"
                :hidden="hidden"
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
import { ref, watch } from 'vue';
import Input from '../components/parts/Input';
import Button from '../components/parts/Button';

export default {
  setup() {
    const inputs = ref(new Array(12));

    for (let i = 0; i < inputs.value.length; i++) {
      inputs.value[i] = { value: '' };
    }

    const passphrase = ref('');
    const hidden = ref(true);

    const toggleHidden = () => (hidden.value = !hidden.value);

    watch(
      inputs,
      (newVal, oldVal) => (passphrase.value = inputs.value.join(' ')),
    );

    return {
      passphrase,
      hidden,
      toggleHidden,
      inputs,
    };
  },
  components: { Button, Input },
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
</style>
