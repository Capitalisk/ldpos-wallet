<template>
  <Navbar />
  <Section>
    <DetailedData v-bind="$attrs" :data="data" />
  </Section>
</template>

<script>
import { inject, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import DetailedData from '../components/DetailedData.vue';
import Section from '../components/Section.vue';
import Navbar from '../components/Navbar.vue';

export default {
  name: 'DetailedPage',
  components: { Section, DetailedData, Navbar },
  setup() {
    const store = inject('store');
    const route = useRoute();
    const data = ref(null);

    console.log(route.params);

    onMounted(async () => {
      const key = Object.keys(route.params)[0];

      const sw = {
        wallet: async () =>
          await store.client.value.getAccount(route.params.wallet),
        transaction: async () =>
          await store.client.value.getTransaction(route.params.transaction),
        delegate: async () =>
          await store.client.value.getDelegate(route.params.delegate),
        default: () => {},
      };

      data.value = await (sw[key] || sw.default)();
    });

    return {
      data
    }
  },
};
</script>
