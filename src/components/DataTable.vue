<template>
  <div class="table flex column relative mb-5">
    <div v-if="hasHeaderSlot || title" class="header flex justify-end pa-2">
      <div class="mr-auto">
        <slot name="header" />
        <p v-if="title && ableToCopyTitle"><Copy :value="title" :link="titleLink" /></p>
        <p v-else-if="title">{{ title }}</p>
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
      <table v-if="rows && rows.length" id="data-table">
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
                  @click="sort(c)"
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
                    :shrink="mustShrink(c.shrinkUntilWidth)"
                  />
                </template>
                <template v-else>
                  {{
                    getShortValue(
                      c.value
                        ? c.value(r[c.field], r, rows, (page - 1) * limit)
                        : r[c.field],
                      c.shrinkUntilWidth,
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
      <span v-else-if="!loading && rows && !rows.length" class="ma-3">
        No records found...
      </span>
    </div>
    <div class="footer">
      <slot name="header" class="pa-2" />
    </div>
  </div>
  <div v-if="fn" class="flex pagination">
    <!-- TODO: Add page one -->
    <Button
      id="previous-page"
      icon="chevron-left"
      @click="previousPage"
      class="pa-1 mr-1 outline"
      :class="{ disabled: page === 1 }"
    />
    <!-- TODO: Allow custom page input -->
    <Button
      id="current-page"
      :value="page"
      @click="() => {}"
      class="pa-1 mr-1 outline disabled"
    />
    <Button
      id="next-page"
      icon="chevron-right"
      @click="nextPage"
      class="pa-1 outline"
    />
    <!-- TODO: Add page two -->
  </div>
</template>

<script>
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
  watchEffect,
} from 'vue';

import { DETAIL_MODAL } from './modals/constants';

import Button from './Button';
import Popup from './Popup';
import Copy from './Copy.vue';
import { useRouter, useRoute } from 'vue-router';

const DEFAULT_POLL_INTERVAL = 10000;

export default {
  name: 'DataTable',
  props: {
    rows: { type: Array, default: null },
    columns: { type: Array, default: () => [] },
    prefixTitle: { type: String, default: null },
    title: { type: String, default: null },
    titleLink: { type: String, default: null },
    ableToCopyTitle: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    fn: { type: [String, Function], default: null },
    limit: { type: Number, default: 10 },
    order: { type: String, default: 'desc' },
    arg: { type: String, default: null },
    prefix: { type: String, default: null },
    prependFn: { type: Function, default: null },
  },
  setup(props, { emit, slots }) {
    const store = inject('store');
    const route = useRoute();
    const router = useRouter();
    const route = useRoute();

    let poller;

    if (!route.query.p) router.push({ query: { ...route.query, p: 1 } });

    const rows = ref([]);
    const table = ref(null);
    const limit = ref(props.limit);
    const order = ref(props.order);
    const columns = ref(props.columns);
    const page = ref(1);
    const popupActive = ref(false);

    const getData = async () => {
      if (typeof props.fn === 'string') {
        if (props.arg) {
          return await store.client.value[props.fn](
            props.arg,
            null,
            (page.value - 1) * limit.value,
            limit.value,
            order.value,
          );
        }
        return await store.client.value[props.fn](
          (page.value - 1) * limit.value,
          limit.value,
          order.value,
        );
      } else if (typeof props.fn === 'function') {
        return await props.fn(
          props.arg,
          null,
          (page.value - 1) * limit.value,
          limit.value,
          order.value,
          page.value,
        );
      } else {
        throw new Error(
          `fn should be a function or string, not a ${typeof props.fn}`,
        );
      }
    };

    const updateRows = async () => {
      store.mutateProgressbarLoading(true);
      const initialPage = page.value;
      const rowData = await getData();
      if (page.value === initialPage) {
        rows.value = rowData;
      }
      store.mutateProgressbarLoading(false);
    };

    const setPoll = async () => {
      if (!props.fn) return;
      if (page.value !== 1) return;
      clearInterval(poller);
      console.log('Start polling');
      poller = setInterval(updateRows, store.state && store.state.config && store.state.config.pollInterval || DEFAULT_POLL_INTERVAL);
    };

    const clearPoll = () => {
      console.log('Stop polling');
      clearInterval(poller);
    };

    const updatePoll = () => {
      if (page.value === 1) {
        setPoll();
      } else {
        clearPoll();
      }
    };

    const handleNewTransfer = async () => {
      if (!props.fn) return;
      if (page.value !== 1) return;
      await updateRows();
    };

    const keyEvents = e => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') previousPage();
    };

    onMounted(async () => {
      if (props.fn) {
        await updateRows();
        setPoll();
      } else {
        rows.value = props.rows;
      }
      window.addEventListener('blur', clearPoll);
      window.addEventListener('focus', setPoll);
      window.addEventListener('keydown', keyEvents);
      window.addEventListener('DataTable:update', handleNewTransfer);
    });

    onUnmounted(() => {
      clearPoll();
      window.removeEventListener('keydown', keyEvents);
      window.removeEventListener('blur', clearPoll);
      window.removeEventListener('focus', setPoll);
      window.removeEventListener('DataTable:update', handleNewTransfer);
    });

    watch(
      () => props.rows,
      n => !props.fn && (rows.value = n),
    );

    const nextPage = async () => {
      page.value++;
      updatePoll();

      if (props.fn) {
        offset.value = (page.value - 1) * props.limit;
        await updateRows();
      }
    };

    const previousPage = async () => {
      if (page.value === 1) return;

      page.value--;
      updatePoll();

      if (props.fn) {
        offset.value = (page.value - 1) * props.limit;
        await updateRows();
      }
    };

    watchEffect(() => page.value && pollerFn());

    const sort = async c => {
      store.mutateProgressbarLoading(true);

      order.value = c.sorted === 'asc' ? 'desc' : 'asc';

      // TODO: This will be for filtering
      const index = columns.value.findIndex(e => e.field === c.field);
      c = { ...c, sorted: order.value };
      columns.value.splice(index, 1, c);

      rows.value = await getData();

      store.mutateProgressbarLoading(false);
    };

    const mustShrink = (shrinkUntilWidth) => {
      return window.innerWidth < shrinkUntilWidth ||
        table.value.scrollWidth > table.value.offsetWidth;
    };

    const getShortValue = (val, shrinkUntilWidth = 0) => {
      if (val === 0) return val.toString();
      if (!val) return;
      if (!shrinkUntilWidth) return val.toString();
      if (
        table.value &&
        typeof val === 'string' &&
        mustShrink(shrinkUntilWidth)
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

    const detail = data => {
      router.push(`/${props.prefix ? props.prefix : 'transactions'}/${data.id || data.address}`);

      window.removeEventListener('keydown', keyEvents);
    };

    return {
      loading: computed(() => store.state.progressbarLoading),
      popupActive,
      table,
      rows,
      columns,
      mustShrink,
      getShortValue,
      sort,
      nextPage,
      previousPage,
      page,
      limit,
      togglePopup: () => (popupActive.value = !popupActive.value),
      detail,
      hasHeaderSlot: !!slots.header,
    };
  },
  components: { Button, Popup, Copy },
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

.pagination {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
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
