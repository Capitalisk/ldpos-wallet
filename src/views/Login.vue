<template>
  <Navbar :title="title" />
  <Wallet v-if="authenticated" />
  <div v-else class="flex flex-wrap flex-gap">
    <Section v-if="!address.data" class="pa-0 fullwidth">
      <LoginForm />
    </Section>
  </div>
</template>

<script setup>
import { inject, computed, watch, reactive } from 'vue';

import { _transformMonetaryUnit } from '../utils.js';

import Navbar from '../components/Navbar';
import Section from '../components/Section';
import Wallet from '../components/Wallet';
import LoginForm from '../components/forms/LoginForm.vue';

defineProps({
  title: { type: String, required: true },
});

const store = inject('store');

const address = reactive({ loading: true, data: null, error: null });

const authenticated = computed(() => store.state.authenticated);
</script>

<style scoped>
.input-number {
  width: 15px;
}
</style>
