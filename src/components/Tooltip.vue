<template>
  <i
    class="far fa-question-circle cursor-pointer"
    @click.stop.prevent="tooltipActive = !tooltipActive"
    ref="tooltipIconRef"
    :class="iconClass"
  />
  <div
    v-if="tooltipActive"
    class="tooltip pa-1 no-select"
    v-bind="$attrs"
    :style="{
      top: $refs.tooltipIconRef.getBoundingClientRect().bottom + 5 + 'px',
      left: $refs.tooltipIconRef.getBoundingClientRect().left + 5 + 'px',
    }"
    ref="tooltipContainerRef"
    @click.stop.prevent
  >
    {{ content }}
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
  name: 'Tooltip',
  props: {
    content: { type: String, required: true },
    iconClass: { type: String, Object },
  },
  setup() {
    const tooltipIconRef = ref(null);
    const tooltipContainerRef = ref(null);
    const tooltipActive = ref(false);

    onMounted(() => {
      window.addEventListener('Document:click', event => {
        !tooltipContainerRef.value.contains(event.detail) &&
          (tooltipActive.value = false);
      });
    });

    return {
      tooltipIconRef,
      tooltipContainerRef,
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

.tooltip.warning {
  border: 1px solid var(--warning);
  color: var(--warning);
  font-weight: 900;
}
</style>
