<template>
  <div class="navbar flex justify-end align-center text-right">
    <i
      v-if="back"
      class="fa fa-arrow-left mr-2 cursor-pointer"
      @click="goBack"
    />
    <h1 class="mr-auto">{{ title }}</h1>
    <template v-if="routes.includes(searchParam)">
      <div v-show="searchActive" style="width: 70%;">
        <Input
          :placeholder="`Search ${searchParam}`"
          ref="searchRef"
          v-model="searchValue"
          @keyup.enter="search"
          @keyup.esc="() => (searchActive = false)"
        >
          <template v-slot:suffix>
            <i
              class="fas fa-search cursor-pointer"
              @click.stop.prevent="search"
            />
            <i
              class="fas fa-times cursor-pointer ml-2"
              @click.stop.prevent="() => (searchActive = false)"
            />
          </template>
        </Input>
      </div>
    </template>
    <template v-if="!searchActive">
      <Button
        v-if="$route.params.accountId"
        router-link
        value="View transactions"
        class="ml-1 mr-2"
        :href="`/accounts/${$route.params.accountId}/transactions`"
      />
      <Connected />
      <span class="flex justify-center align-center mr-2">
        <Switch v-model="darkMode" id="darkmode-switch" />
      </span>
      <Button
        v-if="authenticated"
        value="Sign out"
        @click="signout"
        class="ml-1 mr-2"
      />
      <Button
        value="Sign in"
        router-link
        :href="isElectron ? '/' : '/login'"
        v-else-if="
          (($router.currentRoute.value.path !== '/' && isElectron) ||
            (!isElectron && $router.currentRoute.value.path !== '/login')) &&
            !authenticated
        "
        class="ml-1 mr-2"
      />
      <Button
        v-if="!searchActive && routes.includes(searchParam)"
        icon="search"
        @click="activateSearch"
        class="pa-1 outline"
      />
    </template>
  </div>
</template>

<script>
import { computed, inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Button from './Button';
import Connected from './Connected';
import Switch from './Switch';
import Input from './Input';
import { DETAIL_MODAL } from './modals/constants';
import { _capitalize, _pluralToSingular, _isNumber } from '../utils';

export default {
  name: 'Navbar',
  props: {
    back: { type: Boolean, default: false },
    title: { type: String, required: true },
  },
  setup(props) {
    const store = inject('store');
    const route = useRoute();
    const router = useRouter();

    const searchActive = ref(false);
    const searchRef = ref(null);
    const searchValue = ref(null);

    return {
      searchActive,
      searchRef,
      searchValue,
      searchParam: route.name,
      routes: ['delegates', 'blocks', 'transactions', 'accounts'],
      goBack: () => router.go(-1),
      activateSearch: () => {
        searchActive.value = true;
        setTimeout(() => searchRef.value.focus(), 100);
      },
      authenticated: computed(() => store.state.authenticated),
      signout: async () => store.deauthenticate(),
      darkMode: computed({
        get: () => store.state.darkMode,
        set: val => store.toggleDarkMode(),
      }),
      isElectron: process.env.IS_ELECTRON,
      search: async () => {
        const key = route.name;

        const sw = {
          accounts: async () =>
            await store.client.value.getAccount(searchValue.value),
          transactions: async () =>
            await store.client.value.getTransaction(searchValue.value),
          delegates: async () =>
            await store.client.value.getDelegate(searchValue.value),
          blocks: async () => {
            if (_isNumber(searchValue.value)) {
              return await store.client.value.getBlockAtHeight(
                parseInt(searchValue.value),
              );
            } else {
              return await store.client.value.getBlock(searchValue.value);
            }
          },
          default: () => false,
        };

        try {
          const data = await (sw[key] || sw.default)();
          if (!data) return;

          router.push(
            `${route.path === '/' ? '/transactions' : route.path}/${
              searchValue.value
            }`,
          );
        } catch (e) {
          console.error(e);
          store.notify(
            {
              message: `${_capitalize(
                _pluralToSingular(route.name),
              )} not found.`,
              error: true,
            },
            5,
          );
        }
      },
    };
  },
  components: { Button, Connected, Switch, Input },
};
</script>

<style scoped>
.navbar {
  padding: var(--unit-2) var(--unit-2);
  min-height: 36px;
}

h1 {
  text-transform: capitalize;
}

@media screen and (max-width: 768px) {
  .navbar {
    display: none;
  }
}
</style>
