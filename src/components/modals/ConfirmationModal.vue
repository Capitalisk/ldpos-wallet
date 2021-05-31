<template>
  <Modal ref="modalRef" use-slot>
    <div class="mx-2 my-4 font-bold notification-danger">
      {{ message }}
    </div>
    <div class="ma-2">
      <slot />
    </div>
    <div class="flex justify-end">
      <Button value="Cancel" @click="cancel" class="mr-1 danger outline" />
      <Button value="Continue" @click="pursue" />
    </div>
  </Modal>
</template>

<script>
import { ref } from 'vue';
import Modal from '../Modal';
import Button from '../Button';

export default {
  name: 'ConfirmationModal',
  components: { Modal, Button },
  setup() {
    let resolvePromise, rejectPromise;

    const message = ref(null);
    const showCancelButton = ref(false);
    const modalRef = ref(null);

    return {
      message,
      modalRef,
      show: (opts = {}) => {
        if (!opts.message)
          throw new Error('Message is required for ConfirmationModal');
        if (typeof opts.showCancelButton !== 'boolean')
          throw new Error('showCancelButton should be a boolean');

        modalRef.value.activateModal({ title: 'Register delegate' });
        message.value = opts.message;
        showCancelButton.value = opts.showCancelButton;

        return new Promise((res, rej) => {
          resolvePromise = res;
          rejectPromise = rej;
        });
      },
      pursue: () => {
        modalRef.value.deactivateModal();
        resolvePromise(true);
      },
      cancel: () => {
        modalRef.value.deactivateModal();
        resolvePromise(false);
      },
    };
  },
};
</script>

<style scoped>
.notification-danger {
  border: 1px solid var(--danger);
  border-radius: var(--border-radius);
  padding: var(--unit-2);
  color: var(--danger);
}
</style>
