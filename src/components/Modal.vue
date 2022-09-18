<template>
  <div
    class="modal-background flex justify-center align-center"
    v-if="(!useSlot && active) || (useSlot && slotActive)"
  >
    <div class="wrapper">
      <div
        class="close-btn cursor-pointer"
        @click="useSlot ? deactivateModal() : toggleOrBrowseModal()"
      >
        &#10005;
      </div>
      <div
        v-if="stack.length > 1"
        class="back-btn cursor-pointer"
        @click="toggleOrBrowseModal({ back: true })"
      >
        <i class="fa fa-arrow-left" />
      </div>
      <Section
        :title="
          title ? title : slotTitle || (type && capitalize(type.toLowerCase()))
        "
        class="modal"
        :back-button="stack.length > 1"
        :style="{ height: '100%', padding: '20px', boxSizing: 'border-box' }"
      >
        <div class="force-modal-scroll">
          <template v-if="!useSlot">
            <TokenModal v-if="type === MODAL_CONSTANTS.TOKEN_MODAL" />
            <DetailModal v-else-if="type === MODAL_CONSTANTS.DETAIL_MODAL" />
            <TransferModal
              v-else-if="type === MODAL_CONSTANTS.TRANSFER_MODAL"
            />
            <AddTokenModal
              v-else-if="type === MODAL_CONSTANTS.ADD_TOKEN_MODAL"
            />
          </template>
          <slot v-if="useSlot && slotActive" />
        </div>
      </Section>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';

import * as MODAL_CONSTANTS from './modals/constants';
import { _capitalize } from '../utils';

import Section from './Section';
import TokenModal from './modals/TokenModal.vue';
import DetailModal from './modals/DetailModal.vue';
import TransferModal from './modals/TransferModal.vue';
import AddTokenModal from './modals/AddTokenModal.vue';

defineProps({
  useSlot: {
    type: Boolean,
    default: false,
  },
});

const store = inject('store');

const slotActive = ref(false);
const slotTitle = ref(null);
const stack = computed(() => store.state.modal.stack);

const toggleOrBrowseModal = store.toggleOrBrowseModal;

const escEvent = e => {
  if (e.key === 'Escape') {
    if (stack.value.length > 1) {
      return toggleOrBrowseModal({ back: true });
    }
    toggleOrBrowseModal();
    window.addEventListener('keydown', escEvent);
  }
};

onMounted(() => window.addEventListener('keydown', escEvent));
onUnmounted(() => window.addEventListener('keydown', escEvent));

const active = computed(() => store.state.modal.active);
const type = computed(() => store.state.modal.type);
const title = computed(() => store.state.modal.title);
const data = computed(() => store.state.modal.data);

const capitalize = _capitalize;

const activateModal = (opts = {}) => {
  slotActive.value = true;
  slotTitle.value = opts.title;
};

const deactivateModal = () => {
  slotActive.value = false;
  slotTitle.value = null;
};

defineExpose({ activateModal, deactivateModal });
</script>

<style scoped>
.modal-background {
  position: fixed;
  background: var(--modal-backdrop);
  z-index: 3;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.wrapper {
  position: relative;
  width: 50%;
  max-height: 75%;
}

.close-btn {
  position: absolute;
  top: -3rem;
  right: 0.25rem;
  font-size: var(--unit-4);
  color: var(--dark);
  z-index: 2;
}

.back-btn {
  position: absolute;
  top: -2.5rem;
  left: 0.25rem;
  font-size: var(--unit-3);
  color: var(--permanent-white);
  z-index: 2;
}

.force-modal-scroll {
  overflow-y: auto;
  max-height: 70vh;
}

@media screen and (max-width: 768px) {
  .wrapper {
    width: 100vw;
    height: 100%;
    max-height: 100%;
  }

  .section {
    border-radius: 0 !important;
    padding: var(--unit-2) 0;
  }

  .force-modal-scroll {
    max-height: 95vh;
  }

  .close-btn {
    position: fixed;
    top: 10px;
    right: 15px;
    color: var(--dark);
  }

  .back-btn {
    position: fixed;
    top: 17px;
    left: 15px;
    color: var(--dark);
  }
}
</style>
