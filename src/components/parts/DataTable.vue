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
    <div
      v-if="!loading || firstLoadCompleted"
      class="overflow-x flex flex-wrap column"
      :class="overflow ? 'overflow-y' : 'overflow-y-hidden'"
      ref="table"
      id="table"
    >
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
                  @click="c.sortable && sort(c)"
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
                @click="clickable ? detail(r) : ''"
                v-if="c.active"
              >
                {{
                  getShortValue(
                    c.value ? c.value(r[c.field], r) : r[c.field],
                    c.shrinkable,
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
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';

import { DETAIL_MODAL } from '../modals/constants';

import Loading from '../parts/Loading';
import Button from '../parts/Button';
import Popup from './Popup.vue';
import Progressbar from './Progressbar.vue';

export default {
  name: 'DataTable',
  props: {
    rows: { type: Array, default: null },
    columns: { type: Array, default: () => [] },
    title: { type: String },
    clickable: { type: Boolean, default: false },
    fn: { type: [String, Function], default: null },
    limit: { type: Number, default: 50 },
    order: { type: String, default: 'desc' },
    offset: { type: Number, default: 0 },
  },
  setup(props, { emit }) {
    const store = inject('store');

    const rows = ref([]);
    const oldData = ref([]);
    const table = ref(null);
    const firstLoadCompleted = ref(false);
    const loading = ref(true);
    const limit = ref(props.limit);
    const order = ref(props.order);
    const offset = ref(props.offset);
    const columns = ref(props.columns);
    const overflow = ref(null);

    const getData = async () => {
      if (typeof props.fn === 'string') {
        rows.value = await store.client.value[props.fn](
          offset.value,
          limit.value,
          order.value,
        );
      } else if (typeof props.fn === 'function') {
        rows.value = await props.fn();
      } else {
        throw new Error(
          `fn should be a function or string, not a ${typeof props.fn}`,
        );
      }

      return rows.value;
    };

    onMounted(async () => {
      if (props.fn) {
        try {
          await getData();
        } catch (e) {
          console.log(e);
        }
      } else {
        rows.value = props.rows;
      }

      loading.value = false;
    });

    const loadMore = async () => {
      if (props.fn) {
        if (loading.value) return;
        loading.value = true;

        offset.value = offset.value + 25;
        const d = await getData();

        rows.value = [...rows.value, ...d];
      }

      loading.value = false;
    };

    // TODO: Sort the existing array without a new call
    const sort = async (c) => {
      if (loading.value) return;

      loading.value = true;

      order.value = c.sorted === 'asc' ? 'desc' : 'asc';

      // TODO: This will be for filtering
      const index = columns.value.findIndex((e) => e.field === c.field);
      c = { ...c, sorted: order.value };
      columns.value.splice(index, 1, c);

      await getData();

      loading.value = false;
    };

    watch(
      () => table.value,
      (n) => {
        if (!props.fn) return;
        if (firstLoadCompleted.value) return;
        table.value.addEventListener('scroll', (event) => {
          if (
            table.value.scrollTop >=
            table.value.scrollHeight - table.value.offsetHeight - 20
          )
            if (rows.value.length > oldData.value.length) {
              oldData.value = rows.value;
              loadMore();
            }
        });
        firstLoadCompleted.value = true;
        overflow.value = table.value.scrollHeight - 1 > table.value.offsetHeight;
      },
    );

    const getShortValue = (val, shrinkable = true) => {
      if (val === 0) return val.toString();
      if (!val) return;
      if (!shrinkable) return val.toString();
      if (
        table.value &&
        typeof val === 'string' &&
        (window.innerWidth < 1400 ||
          table.value.scrollWidth > table.value.offsetWidth)
      ) {
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
      loading,
      popupActive,
      table,
      firstLoadCompleted,
      rows,
      columns,
      getShortValue,
      sort,
      togglePopup: () => (popupActive.value = !popupActive.value),
      detail: (data) =>
        store.toggleModal({
          type: DETAIL_MODAL,
          data,
        }),
      overflow,
    };
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
