<template>
  <Navbar />
  <Wallet v-if="authenticated" />
  <div v-else class="flex flex-wrap flex-gap">
    <Section title="Settings" class="flex-12">
      SettingsPage
    </Section>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  setup() {
    return {};
  },
};
</script>

<style scoped>
.login {
  max-width: 985px;
}

.input-number {
  width: 15px;
}
</style>
