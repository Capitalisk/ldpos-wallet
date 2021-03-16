<template>
  <div class="modal-background" v-if="active">
    <div class="wrapper">
      <div class="close-btn cursor-pointer" style="color: var(--white)" @click="toggleModal">
        &#10005;
      </div>
      <Section title="Latest transactions:" backgroundColor="white">
        <div class="force-modal-scroll">
          <TokenModal v-if="modal === TOKENMODAL" />
        </div>
      </Section>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

import Section from './Section';

import modals from '../modals';
import { TOKENMODAL } from '../modals/constants';

export default {
  name: 'Modal',
  setup() {
    const store = useStore();

    console.log(store.state.modal, TOKENMODAL)

    return {
      active: computed(() => store.state.modal.active),
      modal: computed(() => store.state.modal.type),
      toggleModal: () => store.commit('toggleModal', ''),
      TOKENMODAL,
    };
  },
  components: { Section, ...modals },
};
</script>

<style scoped>
.modal-background {
  position: absolute;
  background: rgb(0, 0, 0, 0.7);
  width: 100vw;
  height: 100vh;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper {
  position: relative;
  width: 75%;
  height: 75%;
}

.close-btn {
  position: absolute;
  top: -3rem;
  right: 0.25rem;
  font-size: 2rem;
}

.force-modal-scroll {
  overflow-y: scroll;
  height: 70vh;
}

@media screen and (max-width: 768px) {
  .wrapper {
    width: 100vw;
    height: 100vh;
  }

  .section {
    border-radius: 0 !important;
  }

  .force-modal-scroll {
    height: 100vh;
  }

  .close-btn {
    position: fixed;
    top: 15px;
    right: 15px;
  }
}
</style>
