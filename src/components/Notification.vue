<template>
  <div class="notifications" v-if="notifications">
    <transition-group name="list">
      <div
        v-for="(notification) in Object.values(notifications).reverse()"
        :key="notification"
        class="notification pa-2 ma-2"
        :class="{ danger: notification.error }"
        :ref="
          (el) => {
            if (el) divs[i] = el;
          }
        "
      >
        <Progressbar
          active
          class="notification-progress"
          :danger="notification.error"
          :value="`${(notification.secondsLeft / notification.seconds) * 100}%`"
        />
        <div class="close-btn cursor-pointer" @click="denotify(notification.id)">
          &#10005;
        </div>
        <div class="wrap mr-2">{{ notification.message }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUpdate, onUpdated, ref } from 'vue';
import Progressbar from './Progressbar.vue';

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

const notifications = computed(() => store.state.notifications);

const denotify = (i) => store.denotify(i);
</script>

<style scoped>
.notifications {
  position: fixed;
  bottom: 0px;
  right: 0px;
}

.notification {
  min-width: 400px;
  border-radius: var(--border-radius);
  background-color: var(--primary);
  max-width: 30vw;
  z-index: 10;
  backdrop-filter: blur(4px);
}

@media screen and (max-width: 992px) {
  .notification {
    max-width: 100vw;
    min-width: 100px;
  }
}

.notification.danger {
  background-color: var(--danger-bg);
  color: var(--danger);
  font-weight: 900;
}

.close-btn {
  position: absolute;
  right: var(--unit-1);
  top: var(--unit-1);
  font-size: var(--unit-2);
  color: var(--dark) !important;
  opacity: 0.5;
}

.notification-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
