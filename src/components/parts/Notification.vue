<template>
  <template v-if="notifications">
    <div
      v-for="(notification, i) in notifications"
      :key="i"
      class="notification pa-4 ma-2"
      :ref="
        (el) => {
          if (el) divs[i] = el;
        }
      "
    >
      <div class="close-btn cursor-pointer" @click="denotify(i)">
        &#10005;
      </div>
      {{ notification }}
    </div>
  </template>
</template>

<script>
import { onBeforeUpdate, onUpdated, ref } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Notification',
  setup() {
    const store = useStore();
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
        store.commit(
          'notify',
          'Your session was automatically ended after being inactive for 15 minutes.',
        ),
      denotify: (i) => store.commit('denotify', i),
    };
  },
};
</script>

<style scoped>
.notification {
  position: absolute;
  border: 1px solid var(--primary-darker);
  border-radius: var(--border-radius);
  bottom: 0px;
  right: 0px;
  background-color: var(--primary);
  max-width: 200px;
}

.close-btn {
  position: absolute;
  right: 1rem;
  top: 1rem;
  font-size: 1rem;
}
</style>
