<template>
  <div class="loading">
    <progress
      v-if="loading"
      class="progress-indeterminate"
      max="100"
      :class="classes"
    ></progress>
  </div>
</template>

<script>
export default {
  name: 'Progressbar',
  props: {
    loading: { type: Boolean, default: false },
    classes: { type: String, default: '' },
  },
};
</script>

<style scoped>
.loading {
  min-height: 5px;
}

progress::-webkit-progress-bar {
  background: transparent !important;
}

progress.progress-indeterminate {
  width: 100%;
  display: block;
  height: 5px;
  overflow: hidden;
  padding: 0;
  background: var(--primary-darker)
    linear-gradient(to right, var(--primary) 30%, var(--primary-lighter) 30%) top
    left / 150% 150% no-repeat;
}

progress:indeterminate {
  animation: progress-indeterminate 0.75s linear
    infinite;
}

.table {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
</style>
