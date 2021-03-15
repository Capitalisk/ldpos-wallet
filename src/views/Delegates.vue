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
        <th v-if="authenticated">Vote for delegate</th>
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
        <td v-if="authenticated">
          <Button value="Vote" @click="vote" style="display: initial" />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';

import AccountDetails from '../components/sections/AccountDetails';
import NavBar from '../components/sections/NavBar';
import Button from '../components/parts/Button';

export default {
  name: 'Home',
  components: { AccountDetails, NavBar, Button },
  setup() {
    const store = useStore();

    const delegates = ref(null);

    onMounted(async () => {
      delegates.value = await store.state.client.getForgingDelegates();
    });

    return {
      delegates,
      // vote: async () => await store.state.client.vote(),
      authenticated: computed(() => store.state.authenticated),
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
</style>
