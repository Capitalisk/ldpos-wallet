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

<script setup>
import { ref } from 'vue';
import Modal from '../Modal';
import Button from '../Button';

let resolvePromise, rejectPromise;

const message = ref(null);
const showCancelButton = ref(false);
const modalRef = ref(null);

const show = (opts = {}) => {
  if (!opts.message)
    throw new Error('Message is required for ConfirmationModal');
  if (typeof opts.showCancelButton !== 'boolean')
    throw new Error('showCancelButton should be a boolean');

  modalRef.value.activateModal({ title: opts.title });
  message.value = opts.message;
  showCancelButton.value = opts.showCancelButton;

  return new Promise((res, rej) => {
    resolvePromise = res;
    rejectPromise = rej;
  });
};

const pursue = () => {
  modalRef.value.deactivateModal();
  resolvePromise(true);
};

const cancel = () => {
  modalRef.value.deactivateModal();
  resolvePromise(false);
};

defineExpose({ show })
</script>
