<template>
  <div class="table flex column">
    <div v-if="hasHeaderSlot" class="header flex justify-end pa-2">
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
    <div class="flex flex-wrap column overflow-y-hidden" ref="table" id="table">
      <table v-if="rows && rows.length">
        <thead>
          <template v-for="(c, i) in columns" :key="i">
            <th v-if="c.active" class="pa-2">
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
                  `px-2 py-3 mr-2  ${c.class || ''} ${
                    clickable ? 'cursor-pointer' : ''
                  }`
                "
                @click="clickable ? detail(r) : ''"
                v-if="c.active"
              >
                <template v-if="c.slot">
                  <slot
                    :name="c.name"
                    :row="r"
                    :column="c"
                    :rows="rows"
                    :shrink="
                      innerWidth < 1400 || table.scrollWidth > table.offsetWidth
                    "
                  />
                </template>
                <template v-else>
                  {{
                    getShortValue(
                      c.value ? c.value(r[c.field], r, rows) : r[c.field],
                      c.shrinkable,
                    ) ||
                      r.default ||
                      '-'
                  }}
                </template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
      <span v-else-if="!loading && rows && !rows.length" class="ma-3"
        >No data available...</span
      >
    </div>
    <div class="footer">
      <slot name="header" class="pa-2" />
    </div>
  </div>
</template>

<script>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';

import { DETAIL_MODAL } from './modals/constants';

import Button from './Button';
import Popup from './Popup';

export default {
  name: 'DataTable',
  props: {
    rows: { type: Array, default: null },
    columns: { type: Array, default: () => [] },
    title: { type: String },
    clickable: { type: Boolean, default: false },
    fn: { type: [String, Function], default: null },
    limit: { type: Number, default: 25 },
    order: { type: String, default: 'desc' },
    offset: { type: Number, default: 0 },
    arg: { type: String, default: null },
    prefix: { type: String, default: null },
  },
  setup(props, { emit, slots }) {
    const store = inject('store');

    const rows = ref([]);
    const countLoadMore = ref(1);
    const table = ref(null);
    const limit = ref(props.limit);
    const order = ref(props.order);
    const offset = ref(props.offset);
    const columns = ref(props.columns);
    const popupActive = ref(false);

    const getData = async () => {
      if (typeof props.fn === 'string') {
        if (props.arg) {
          return await store.client.value[props.fn](
            props.arg,
            null,
            offset.value,
            limit.value,
            order.value,
          );
        }
        return await store.client.value[props.fn](
          offset.value,
          limit.value,
          order.value,
        );
      } else if (typeof props.fn === 'function') {
        return await props.fn();
      } else {
        throw new Error(
          `fn should be a function or string, not a ${typeof props.fn}`,
        );
      }
    };

    onMounted(async () => {
      store.mutateProgressbarLoading(true);

      if (props.fn) {
        try {
          rows.value = await getData();
        } catch (e) {
          console.error(e);
        }
      } else {
        rows.value = props.rows;
      }

      store.mutateProgressbarLoading(false);

      window.onscroll = () => {
        if (
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight
        ) {
          loadMore();
        }
      };
    });

    watch(
      () => props.rows,
      n => !props.fn && (rows.value = n),
    );

    const loadMore = async () => {
      // If less rows then limit don't load more
      if (rows.value.length < limit.value * countLoadMore.value) return;

      countLoadMore.value++;

      if (props.fn) {
        if (store.state.progressbarLoading) return;
        store.mutateProgressbarLoading(true);

        offset.value = offset.value + 25;
        const d = await getData();

        rows.value = [...rows.value, ...d];
      }

      store.mutateProgressbarLoading(false);
    };

    const sort = async c => {
      if (store.state.progressbarLoading) return;

      store.mutateProgressbarLoading(true);

      order.value = c.sorted === 'asc' ? 'desc' : 'asc';

      // TODO: This will be for filtering
      const index = columns.value.findIndex(e => e.field === c.field);
      c = { ...c, sorted: order.value };
      columns.value.splice(index, 1, c);

      rows.value = await getData();

      store.mutateProgressbarLoading(false);
    };

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

    return {
      loading: computed(() => store.state.progressbarLoading),
      popupActive,
      table,
      rows,
      columns,
      getShortValue,
      sort,
      togglePopup: () => (popupActive.value = !popupActive.value),
      detail: data => {
        if (props.prefix) {
          let newUrl = `${window.location.origin}${
            process.env.VUE_APP_BASE_URL
          }/#/${props.prefix}/${data.id || data.address}`;
          history.pushState({}, null, newUrl);
        }
        store.toggleOrBrowseModal({
          type: DETAIL_MODAL,
          data,
          hasPrefix: props.prefix ? true : false,
        });
      },
      hasHeaderSlot: !!slots.header,
      innerWidth: window.innerWidth,
    };
  },
  components: { Button, Popup },
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
  background-color: var(--primary-darker);
}

th {
  font-size: 14px;
}
</style>
