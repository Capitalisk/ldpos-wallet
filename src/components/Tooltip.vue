<template>
  <i
    class="far fa-question-circle cursor-pointer"
    @click="tooltipActive = !tooltipActive"
    ref="tooltipRef"
  />
  <div
    v-if="tooltipActive"
    class="tooltip pa-1 no-select"
    :style="{
      top: $refs.tooltipRef.getBoundingClientRect().bottom + 5 + 'px',
      left: $refs.tooltipRef.getBoundingClientRect().left + 5 + 'px',
    }"
  >
    {{ content }}
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Tooltip',
  props: {
    content: { type: String, required: true },
  },
  setup() {
    const tooltipRef = ref(null);
    const tooltipActive = ref(false);

    return {
      tooltipRef,
      tooltipActive,
    };
  },
};
</script>

<style scoped>
.tooltip {
  position: fixed;
  /* border: 1px solid var(--dark); */
  border-radius: var(--border-radius);
  background-color: var(--primary-darker);
  max-width: 30vw;
  z-index: 10;
}

.tooltip.danger {
  border: 1px solid var(--danger);
  color: var(--danger);
  font-weight: 900;
}
</style>
