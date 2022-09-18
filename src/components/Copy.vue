<template>
  <div class="wrap-break-all">
    <template v-if="value">
      <router-link @click.stop.prevent v-if="link" :to="link">
        <span ref="copyRef" :class="{ wrap, ellipsis }">
          {{ shrink ? shrinkValue(value) : value }}
        </span>
      </router-link>
      <span v-else ref="copyRef" :class="{ wrap, ellipsis }">
        {{ shrink ? shrinkValue(value) : value }}
      </span>
      <i
        class="far fa-copy cursor-pointer pl-1"
        @click.prevent.stop
        @click="copy"
      />
    </template>
    <template v-else>-</template>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue';

const props = defineProps({
  value: { type: [String, Number, null], default: '', required: true },
  shrink: { type: Boolean, default: false },
  wrap: { type: Boolean, default: false },
  ellipsis: { type: Boolean, default: false },
  link: { type: String, default: null, required: false },
});
const store = inject('store');
const copyRef = ref(null);

const copy = () => {
  navigator.clipboard.writeText(props.value);

  store.notify({ message: `Copied: ${props.value}` }, 5);
};

const shrinkValue = (val) => {
  if (val.length > 14) {
    const arr = val.split('');
    return [
      ...arr.slice(0, 6),
      '...',
      ...arr.slice(arr.length - 4, arr.length),
    ].join('');
  }
  return val.toString();
};
</script>
