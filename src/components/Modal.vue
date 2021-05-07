<template>
  <div class="modal-background flex justify-center align-center" v-if="active">
    <div class="wrapper">
      <div class="close-btn cursor-pointer" @click="toggleModal">&#10005;</div>
      <Section
        :title="title || (type && capitalize(type.toLowerCase()))"
        class="modal"
        :style="{ height: '100%', paddingTop: 'var(--unit-4)' }"
      >
        <div class="force-modal-scroll">
          <TokenModal v-if="type === TOKEN_MODAL" />
          <DetailModal v-if="type === DETAIL_MODAL" />
          <TransferModal v-if="type === TRANSFER_MODAL" />
          <SettingsModal v-if="type === SETTINGS_MODAL" />
        </div>
      </Section>
    </div>
  </div>
</template>

<script>
import { computed, inject } from 'vue';

import modals from './modals';
import * as modalConstants from './modals/constants';
import { _capitalize } from '../utils';

import Section from './Section';

export default {
  name: 'Modal',
  setup() {
    const store = inject('store');

    return {
      active: computed(() => store.state.modal.active),
      type: computed(() => store.state.modal.type),
      title: computed(() => store.state.modal.title),
      data: computed(() => store.state.modal.data),
      toggleModal: () => store.toggleModal(),
      ...modalConstants,
      capitalize: _capitalize,
    };
  },
  components: { Section, ...modals },
};
</script>

<style scoped>
.modal-background {
  position: fixed;
  background: rgb(0, 0, 0, 0.7);
  width: 100vw;
  height: 100vh;
  z-index: 3;
}

.wrapper {
  position: relative;
  width: 75%;
  max-height: 75%;
}

.close-btn {
  position: absolute;
  top: -3rem;
  right: 0.25rem;
  font-size: var(--unit-4);
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
    height: 100vh;
    max-height: 100vh;
  }

  .section {
    border-radius: 0 !important;
    padding: var(--unit-4) 0 !important;
  }

  .force-modal-scroll {
    max-height: 100vh;
  }

  .close-btn {
    position: fixed;
    top: 15px;
    right: 15px;
    color: var(--dark);
  }
}
</style>
