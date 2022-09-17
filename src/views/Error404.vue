<template>
  <Section>
    <div class="mb-2 flex align-center">
      <div class="back-btn cursor-pointer" @click="router.go(-1)">
        <i class="fa fa-arrow-left" />
      </div>
      <h1 class="ml-2">Error 404 - Page not found</h1>
    </div>
    <div class="flex justify-center">
      <LottiePlayer
        :animation-data="error404"
        background="transparent"
        speed="1"
        style="width: 500px; height: 500px;"
        loop
        autoplay
      />
    </div>
  </Section>
</template>

<script setup>
import { useRouter } from 'vue-router';

import Section from '../components/Section';
import LottiePlayer from '../components/LottiePlayer';

import error404 from '../animations/404.json';

const router = useRouter();
</script>

<style scoped>
.back-btn {
  font-size: var(--unit-3);
}
</style>
