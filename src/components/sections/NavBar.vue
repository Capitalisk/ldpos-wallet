<template>
  <div class="navbar">
    <span class="connection">Connection </span>
    <span
      class="dot"
      :style="{
        backgroundColor: connected ? 'var(--success)' : 'var(--danger)',
      }"
    ></span>
    <Button value="Sign in" router-link href="/login" />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';

import { useClient } from '../../plugins/ldpos-client';

import Button from '../parts/Button';

export default {
  name: 'NavBar',
  setup() {
    const connected = ref(false);

    onMounted(async () => {
      const { connected: c } = await useClient();
      connected.value = c;
    });

    return {
      connected,
    };
  },
  components: { Button },
};
</script>

<style scoped>
.navbar {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  text-align: right;
  padding: 0 1rem 1rem;
}

.account {
  cursor: pointer;
}

.connection {
  padding: 0 1rem;
}

.dot {
  height: 10px;
  width: 10px;
  display: inline-block;
  border-radius: 50%;
  margin-right: auto;
}
</style>
