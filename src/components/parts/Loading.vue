<template>
  <div class="loading">
    <img src="../../assets/loading.svg" alt="Loading">
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    size: {
      type: Number,
      default: 25,
    },
  },
};
</script>

<style scoped>
.loading {
  margin: 1rem;
  text-align: center;
}
</style>
