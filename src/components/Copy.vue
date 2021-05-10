<template>
  <div class="nowrap">
    <span ref="copyRef">{{ value }}</span>
    <i
      class="fas fa-copy cursor-pointer pl-1"
      @click.prevent.stop
      @click="copy"
    ></i>
  </div>
</template>

<script>
import { inject, ref, computed } from 'vue';

export default {
  name: 'Copy',
  props: {
    value: { type: String, default: '' },
    trim: { type: Boolean, default: false },
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
      copyRef,
      value: computed(() =>
        props.trim && props.value
          ? [...props.value.split('').slice(0, 20), '...'].join('')
          : props.value,
      ),
    };
  },
};
</script>
