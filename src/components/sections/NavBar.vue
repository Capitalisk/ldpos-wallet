<template>
  <div class="navbar">
    <span class="connection"
      >{{ connected ? `Connected: ${net}` : 'Disconnected' }}
    </span>
    <span
      class="dot"
      :style="{
        backgroundColor: connected ? 'var(--success)' : 'var(--danger)',
      }"
    />
    <Button v-if="walletConnected" value="Sign out" @click="signout" />
    <Button value="Sign in" router-link href="/login" v-else />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';

import { useClient, deauthenticate } from '../../plugins/ldpos-client';

import Button from '../parts/Button';

export default {
  name: 'NavBar',
  setup() {
    const connected = ref(false);
    const walletConnected = ref(false);
    const net = ref(null);

    onMounted(async () => {
      const {
        connected: c,
        walletConnected: wC,
        network: {
          options: { port },
        },
      } = await useClient();

      connected.value = c;
      walletConnected.value = wC;
      net.value = port === '7001' ? 'Testnet' : 'Mainnet';
    });

    const signout = async () => {
      const { walletConnected: wC } = await deauthenticate();
      walletConnected.value = wC;
    };

    return {
      connected,
      walletConnected,
      signout,
      net,
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
  padding: 0 1rem;
}

.account {
  cursor: pointer;
}

.connection {
  padding: 0 0.5rem;
}

.dot {
  height: 6px;
  width: 6px;
  display: inline-block;
  border-radius: 50%;
  margin-right: auto;
}
</style>
