<template>
  <i
    class="far fa-question-circle cursor-pointer"
    @click.stop.prevent="tooltipActive = !tooltipActive"
    ref="tooltipIconRef"
    :class="iconClass"
  />
  <transition name="fade">
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
  </transition>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>

<script setup>
import { onMounted, onUnmounted, ref, defineComponent } from 'vue';

defineProps({
  content: { type: String, required: true },
  iconClass: { type: String, Object },
});
const tooltipIconRef = ref(null);
const tooltipContainerRef = ref(null);
const tooltipActive = ref(false);

const click = event => {
  if (tooltipIconRef.value.contains(event.detail)) return;

  tooltipContainerRef.value &&
    !tooltipContainerRef.value.contains(event.detail) &&
    (tooltipActive.value = false);
};

onMounted(() => {
  window.addEventListener('Document:click', click);
});

onUnmounted(() => {
  window.removeEventListener('Document:click', click);
});
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
