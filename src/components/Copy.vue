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

<script>
import { inject, ref } from 'vue';

export default {
  name: 'Copy',
  props: {
    value: { type: [String, Number, null], default: '', required: true },
    shrink: { type: Boolean, default: false },
    wrap: { type: Boolean, default: false },
    ellipsis: { type: Boolean, default: false },
    link: { type: String, default: null, required: false },
  },
  setup(props) {
    const store = inject('store');
    const copyRef = ref(null);

    return {
      copy: () => {
        const copyText = document.createElement('input');
        document.body.appendChild(copyText);
        copyText.value = props.value;
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.body.removeChild(copyText);

        store.notify({ message: `Copied: ${props.value}` }, 5);
      },
      shrinkValue: val => {
        if (val.length > 14) {
          const arr = val.split('');
          return [
            ...arr.slice(0, 6),
            '...',
            ...arr.slice(arr.length - 4, arr.length),
          ].join('');
        }
        return val.toString();
      },
      copyRef,
    };
  },
};
</script>
