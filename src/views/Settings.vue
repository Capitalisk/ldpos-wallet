<template>
  <Navbar />
  <div class="flex flex-wrap flex-gap">
    <Section height-auto class="flex-12">
      
    </Section>
  </div>
</template>

<script>
import Navbar from '../components/Navbar';
import Section from '../components/Section';

export default {
  name: 'Settings',
  components: { Navbar, Section },
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
