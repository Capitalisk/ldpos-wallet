<template>
  <template v-if="notifications">
    <div
      v-for="(notification, i) in notifications"
      :key="i"
      class="notification pa-4 ma-2"
      :class="notification.error ? 'danger' : ''"
      :ref="
        el => {
          if (el) divs[i] = el;
        }
      "
    >
      <div class="close-btn cursor-pointer" @click="denotify(i)">&#10005;</div>
      <div class="break mr-2">{{ notification.message }}</div>
    </div>
  </template>
</template>

<script>
import { inject, onBeforeUpdate, onUpdated, ref } from 'vue';

export default {
  name: 'Notification',
  setup() {
    const store = inject('store');
    const divs = ref([]);

    onBeforeUpdate(() => (divs.value = []));

    onUpdated(() => {
      for (let i = 0; i < divs.value.length; i++) {
        const notification = divs.value[i];
        const bottom = (notification.offsetHeight + 10) * i;
        notification.style.bottom = `${bottom}px`;
      }
    });

    const notifications = store.state.notifications;

    return {
      notifications,
      divs,
      notify: () =>
        store.notify({
          message:
            'Your session was automatically ended after being inactive for 15 minutes.',
        }),
      denotify: i => store.denotify(i),
    };
  },
};
</script>

<style scoped>
.notification {
  position: absolute;
  border: 1px solid var(--dark);
  border-radius: var(--border-radius);
  bottom: 0px;
  right: 0px;
  background-color: var(--primary);
  max-width: 30vw;
  z-index: 10;
}

.notification.danger {
  border: 1px solid var(--danger);
  color: var(--danger);
  font-weight: 900;
}

.close-btn {
  position: absolute;
  right: var(--unit-2);
  font-size: var(--unit-2);
  color: var(--dark) !important;
}
</style>
