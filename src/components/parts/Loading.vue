<template>
  <div class="loading">
    <i class="fa fa-circle-o-notch fa-spin mr-1"></i>Loading
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
  width: 100%;
}
</style>
