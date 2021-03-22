<template>
  <div class="table flex column fixed-height">
    <Progressbar :loading="loading" classes="table" />
    <div class="header flex justify-end pa-2">
      <div class="mr-auto">
        <slot name="header" />
        <h2 v-if="title">{{ title }}</h2>
      </div>
      <div class="relative">
        <Button v-if="false" value="Filter" @click="togglePopup" />
        <Popup :active="popupActive">
          <div class="flex column">
            <div>Testing this</div>
            <div>Testing this</div>
            <div>Testing this</div>
            <div>Testing this</div>
            <div>Testing this</div>
          </div>
        </Popup>
      </div>
    </div>
    <div class="overflow-x overflow-y flex flex-wrap column pb-2" id="table">
      <table>
        <thead>
          <template v-for="(c, i) in columns" :key="i">
            <th v-if="c.active" class="px-2 py-4">
              <div class="flex justify-end">
                <div class="mr-auto">
                  {{ c.label }}
                </div>
                <div
                  v-if="c.sortable"
                  id="sorting"
                  class="cursor-pointer"
                  @click="
                    c.sortable &&
                      $emit('sort', c, c.sorted === 'asc' ? 'desc' : 'asc')
                  "
                >
                  <i class="fas fa-sort-up" v-if="c.sorted === 'asc'"></i>
                  <i
                    class="fas fa-sort-down"
                    v-else-if="c.sorted === 'desc'"
                  ></i>
                  <i class="fas fa-sort" v-else></i>
                </div>
              </div>
            </th>
          </template>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <template v-for="(c, i) in columns" :key="i">
              <td
                :class="
                  `px-2 py-4 mr-2  ${c.class || ''} ${
                    clickable ? 'cursor-pointer' : ''
                  }`
                "
                @click="clickable ? $emit('detail', r) : ''"
                v-if="c.active"
              >
                {{
                  getShortValue(
                    c.value ? c.value(r[c.field], r) : r[c.field],
                    c.noWrap,
                  ) ||
                    r.default ||
                    '-'
                }}
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <slot name="header" class="pa-2" />
    </div>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';

import Loading from '../parts/Loading';
import Button from '../parts/Button';
import Popup from './Popup.vue';
import Progressbar from './Progressbar.vue';

export default {
  name: 'DataTable',
  props: {
    rows: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    title: { type: String },
    loading: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const oldData = ref([]);

    onMounted(() => {
      const table = document.getElementById('table');
      table.addEventListener('scroll', (event) => {
        if (table.scrollTop >= table.scrollHeight - table.offsetHeight - 20)
          if (props.rows.length > oldData.value.length) {
            oldData.value = props.rows;
            emit('get-data');
          }
      });
    });

    const getShortValue = (val, noWrap = false) => {
      if (val === 0) return val.toString();
      if (!val) return;
      if (noWrap) return val
      if (typeof val === 'string' && window.innerWidth < 1400) {
        if (val.length > 16) {
          const arr = val.split('');
          return [
            ...arr.slice(0, 9),
            '...',
            ...arr.slice(arr.length - 5, arr.length),
          ].join('');
        }
      }
      return val.toString();
    };

    const popupActive = ref(false);

    return {
      getShortValue,
      togglePopup: () => (popupActive.value = !popupActive.value),
      popupActive,
    };
  },
  mounted: function() {
    // TODO: make this debounced
    window.addEventListener('resize', () => this.$forceUpdate());
  },
  components: { Loading, Button, Popup, Progressbar },
};
</script>

<style scoped>
.table {
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  background-color: var(--primary);
}

#table::-webkit-scrollbar {
  width: 20px;
  height: 20px;
}

#table::-webkit-scrollbar-track {
  background-color: transparent;
}

#table::-webkit-scrollbar-thumb {
  background-color: var(--dark);
  border-radius: 20px;
  border: 6px solid transparent;
  background-clip: content-box;
}

#table::-webkit-scrollbar-thumb:horizontal {
  height: 20px;
}

#table::-webkit-scrollbar-thumb:hover {
  background-color: var(--dark);
}

#table::-webkit-scrollbar-corner {
  display: none;
}

table {
  border-collapse: collapse;
}

td {
  border-bottom: 1px solid var(--primary-darker);
  white-space: nowrap;
}

tr:hover {
  background-color: var(--primary-lightest);
  color: var(--permanent-white);
}

th {
  font-size: 14px;
}
</style>
