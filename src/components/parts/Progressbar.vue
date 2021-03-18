<template>
  <div class="loading">
    <progress
      v-if="loading"
      class="progress-indeterminate"
      max="100"
    ></progress>
  </div>
</template>

<script>
export default {
  name: 'Progressbar',
  props: {
    loading: { type: Boolean, default: false },
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
    linear-gradient(to right, var(--primary) 30%, var(--primary-darker) 30%) top
    left / 150% 150% no-repeat;
}

progress:indeterminate {
  animation: progress-indeterminate 1.5s cubic-bezier(0.01, 0.05, 0.20, 0.25) infinite;
}
</style>
