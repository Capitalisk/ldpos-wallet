<template>
  <NavBar />
  <!-- <AccountDetails /> -->
  <div class="delegates">
    <table>
      <thead>
        <th>Rank</th>
        <th>Delegate</th>
        <th>Height</th>
        <th>Vote weight</th>
        <th v-if="connected">Voting</th>
      </thead>
      <tr v-for="(delegate, i) in delegates" :key="i">
        <td>#{{ i + 1 }}</td>
        <td>
          Nickname<br />
          <span class="delegate-address">{{ delegate.address }}</span>
        </td>
        <td>{{ delegate.updateHeight }}</td>
        <td>
          CⱠ <strong>{{ delegate.voteWeight }}</strong>
        </td>
        <td v-if="connected">
          <Button value="Vote" @click="vote" style="display: initial" />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { useClient } from '../plugins/ldpos-client';
import AccountDetails from '../components/sections/AccountDetails';
import NavBar from '../components/sections/NavBar';
import Button from '../components/parts/Button';
import { onMounted, ref } from 'vue';

export default {
  name: 'Home',
  components: { AccountDetails, NavBar, Button },
  setup() {
    const delegates = ref(null);
    const forged = ref(null);
    const walletConnected = ref(null);

    onMounted(async () => {
      const { network, walletConnected: wC } = await useClient();

      delegates.value = await network.getForgingDelegates();
      walletConnected.value = wC;
    });

    return {
      delegates,
      walletConnected,
    };
  },
};
</script>

<style scoped>
.delegates {
  width: 100%;
  display: flex;
}

.delegate-address {
  color: var(--primary-lightest);
}

table {
  border-spacing: 0;
  width: 100%;
}

td,
th {
  padding: 0.25rem 1rem;
  text-align: left;
}

th {
  border-bottom: 1px solid var(--white);
}
</style>
