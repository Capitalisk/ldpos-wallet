<template>
  <div class="table flex column relative mb-5">
    <div v-if="hasHeaderSlot || title" class="header flex justify-end pa-2">
      <div class="mr-auto">
        <slot name="header" />
        <p v-if="title && ableToCopyTitle"><Copy :value="title" /></p>
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
                    :shrink="shrink"
                  />
                </template>
                <template v-else>
                  {{
                    getShortValue(
                      c.value
                        ? c.value(r[c.field], r, rows, offset)
                        : r[c.field],
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
      :class="{ disabled: page === 1 || disablePageSwitch }"
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
      :class="{ disabled: disablePageSwitch }"
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
  ref,
  watch,
  watchEffect,
} from 'vue';

import Button from './Button';
import Popup from './Popup';
import Copy from './Copy.vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'DataTable',
  props: {
    rows: { type: Array, default: null },
    columns: { type: Array, default: () => [] },
    prefixTitle: { type: String, default: null },
    title: { type: String, default: null },
    ableToCopyTitle: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    fn: { type: [String, Function], default: null },
    limit: { type: Number, default: 10 },
    order: { type: String, default: 'desc' },
    offset: { type: Number, default: 0 },
    arg: { type: String, default: null },
    prefix: { type: String, default: null },
    prependFn: { type: Function, default: null },
  },
  setup(props, { slots }) {
    const store = inject('store');
    const router = useRouter();

    let poller;

    const rows = ref([]);
    const table = ref(null);
    const limit = ref(props.limit);
    const order = ref(props.order);
    const offset = ref(props.offset);
    const columns = ref(props.columns);
    const page = ref(1);
    const intervalActive = ref(false);
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
        return await props.fn(
          props.arg,
          null,
          offset.value,
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

    const setProgressbarAndGetData = async () => {
      store.mutateProgressbarLoading(true);
      rows.value = await getData();
      store.mutateProgressbarLoading(false);
    };

    const setPoll = async () => {
      if (!props.fn) return;
      if (page.value !== 1 && intervalActive.value) return;
      console.log('poll');
      await setProgressbarAndGetData();
      intervalActive.value = true;
      poller = setInterval(async () => (rows.value = await getData()), 10000);
    };

    const clearPoll = () => {
      if (!props.fn) return;
      console.log('cleared');
      intervalActive.value = false;
      clearInterval(poller);
    };

    const keyEvents = e => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') previousPage();
    };

    onMounted(async () => {
      store.mutateProgressbarLoading(true);

      if (props.fn) {
        await setProgressbarAndGetData();
        setPoll();
        intervalActive.value = true;
      } else {
        rows.value = props.rows;
      }

      store.mutateProgressbarLoading(false);

      window.addEventListener('blur', clearPoll);
      window.addEventListener('focus', setPoll);
      window.addEventListener('keydown', keyEvents);
      window.addEventListener('DataTable:update', setProgressbarAndGetData);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', keyEvents);
      window.removeEventListener('DataTable:update', setProgressbarAndGetData);
      clearPoll();
      window.removeEventListener('blur', clearPoll);
      window.removeEventListener('focus', setPoll);
    });

    watch(
      () => props.rows,
      n => !props.fn && (rows.value = n),
    );

    const nextPage = async () => {
      if (store.state.progressbarLoading) return;

      page.value++;

      if (props.fn) {
        if (store.state.progressbarLoading) return;
        offset.value = offset.value + props.limit;
        await setProgressbarAndGetData();
      }

      clearPoll();
    };

    const previousPage = async () => {
      if (store.state.progressbarLoading) return;
      if (page.value === 1) return;

      page.value--;
      if (page.value === 1) setPoll();

      if (props.fn) {
        if (store.state.progressbarLoading) return;
        store.mutateProgressbarLoading(true);
        offset.value = offset.value - props.limit;
        await setProgressbarAndGetData();
      }
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

    const detail = data => {
      router.push(
        `/${props.prefix ? props.prefix : 'transactions'}/${data.id ||
          data.address}`,
      );

      window.removeEventListener('keydown', keyEvents);
    };

    watchEffect(
      () =>
        !store.state.modal.active &&
        window.addEventListener('keydown', keyEvents),
    );

    return {
      loading: computed(() => store.state.progressbarLoading),
      popupActive,
      table,
      rows,
      columns,
      getShortValue,
      sort,
      nextPage,
      previousPage,
      page,
      limit,
      offset,
      togglePopup: () => (popupActive.value = !popupActive.value),
      detail,
      shrink: computed(
        () => window.innerWidth < 1400 || table.scrollWidth > table.offsetWidth,
      ),

      hasHeaderSlot: !!slots.header,
      disablePageSwitch: computed(() => store.state.progressbarLoading),
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
