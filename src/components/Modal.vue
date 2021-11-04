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
        :style="{ height: '100%' }"
      >
        <div class="force-modal-scroll">
          <template v-if="!useSlot">
            <TokenModal v-if="type === TOKEN_MODAL" />
            <DetailModal v-if="type === DETAIL_MODAL" />
            <TransferModal v-if="type === TRANSFER_MODAL" />
            <AddTokenModal v-if="type === ADD_TOKEN_MODAL" />
          </template>
          <slot v-if="useSlot && slotActive" />
        </div>
      </Section>
    </div>
  </div>
</template>

<script>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';

import modals from './modals';
import * as modalConstants from './modals/constants';
import { _capitalize } from '../utils';

import Section from './Section';

export default {
  name: 'Modal',
  props: {
    useSlot: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = inject('store');

    const slotActive = ref(false);
    const slotTitle = ref(null);

    const toggleOrBrowseModal = store.toggleOrBrowseModal;

    const escEvent = e => {
      e.key === 'Escape' && toggleOrBrowseModal();
      window.addEventListener('keydown', escEvent);
    };

    onMounted(() => window.addEventListener('keydown', escEvent));
    onUnmounted(() => window.addEventListener('keydown', escEvent));

    return {
      active: computed(() => store.state.modal.active),
      type: computed(() => store.state.modal.type),
      title: computed(() => store.state.modal.title),
      data: computed(() => store.state.modal.data),
      stack: computed(() => store.state.modal.stack),
      toggleOrBrowseModal,
      ...modalConstants,
      capitalize: _capitalize,
      slotActive,
      slotTitle,
      activateModal: (opts = {}) => {
        slotActive.value = true;
        slotTitle.value = opts.title;
      },
      deactivateModal: () => {
        slotActive.value = false;
        slotTitle.value = null;
      },
    };
  },
  components: { Section, ...modals },
};
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
