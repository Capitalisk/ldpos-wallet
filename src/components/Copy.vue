<template>
  <div class="nowrap">
    <template v-if="value">
      <span ref="copyRef">{{ shrink ? shrinkValue(value) : value }}</span>
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
import { inject, ref, computed } from 'vue';

export default {
  name: 'Copy',
  props: {
    value: { type: [String, Number], default: '' },
    shrink: { type: Boolean, default: false },
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
        if (val.length > 16) {
          const arr = val.split('');
          return [
            ...arr.slice(0, 9),
            '...',
            ...arr.slice(arr.length - 5, arr.length),
          ].join('');
        }
        return val.toString();
      },
      copyRef,
    };
  },
};
</script>
