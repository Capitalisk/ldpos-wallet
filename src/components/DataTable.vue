<template>
  <div class="table flex column relative mb-7">
    <div v-if="hasHeaderSlot || title" class="header flex justify-end pa-2">
      <div class="mr-auto">
        <slot name="header" />
        <p v-if="title && ableToCopyTitle">
          <Copy :value="title" :link="titleLink" />
        </p>
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
    <div class="flex flex-wrap column overflow-y-hidden box-shadow-white-mode" ref="table" id="table">
      <table v-if="rows && rows.length" id="data-table">
        <thead>
          <template v-for="(c, i) in columns" :key="i">
            <th
              v-if="c.active"
              :class="`pa-2${c.hideOnMobile ? ' mobile-hidden' : ''}`"
            >
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
                :class="`px-2 py-3 mr-2${c.class ? ' ' + c.class : ''}${
                  clickable ? ' cursor-pointer' : ''
                }${c.hideOnMobile ? ' mobile-hidden' : ''}`"
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
                        ? c.value(r[c.field], r, rows, offset)
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
        <div class="flex justify-center">
          <h1>No results found</h1>
        </div>
        <div class="flex justify-center">
          <LottiePlayer
            :animation-data="notFound"
            background="transparent"
            speed="1"
            loop
            controls
            autoplay
          />
        </div>
      </span>
    </div>
    <div class="footer">
      <slot name="header" class="pa-2" />
    </div>
  </div>
  <div v-if="fn && paginate" class="flex pagination">
    <!-- TODO: Add page one -->
    <Button
      id="previous-page"
      icon="chevron-left"
      @click="previousPage"
      class="mr-1 outline pagination-button"
      width="36px"
      height="36px"
      :class="{ disabled: page === 1 }"
    />
    <Button
      id="page-one"
      @click="() => definePage(1)"
      class="mr-1 cursor-pointer outline pagination-button"
      v-if="page !== 1"
      :value="1"
      width="36px"
      height="36px"
      small
    />
    <Button
      v-if="page <= 2 && (!pageInputValue || !pageInput)"
      id="current-page"
      class="mr-1 disabled cursor-pointer outline pagination-button"
      :value="page"
      disabled
      width="36px"
      height="36px"
      small
    />
    <Button
      @click="activatePageInput"
      class="mr-1 cursor-pointer outline pagination-button"
      value="..."
      width="36px"
      height="36px"
      small
      v-if="!pageInput"
    />
    <TransitionExpand>
      <div v-if="pageInput">
        <Input
          placeholder="Page"
          class="mr-1 mobile-width"
          v-model="pageInputValue"
          @keyup.enter="() => definePage(pageInputValue, true)"
          @keyup.esc="() => (pageInput = false)"
          ref="pageInputRef"
          :rules="[
            (v) => !!v || 'No input',
            (v) => Number.isInteger(parseInt(v)) || 'Only numbers',
            (v) => parseInt(v) <= 999 || 'Too big',
          ]"
        >
          <template v-slot:suffix>
            <i
              class="fas fa-times cursor-pointer ml-2"
              @click.stop.prevent="() => (pageInput = false)"
            />
          </template>
        </Input>
      </div>
    </TransitionExpand>
    <Button
      v-if="page > 2 && (!pageInputValue || !pageInput)"
      id="current-page"
      class="mr-1 disabled cursor-pointer outline pagination-button"
      :value="page"
      disabled
      width="36px"
      height="36px"
      small
    />
    <Button
      id="next-page"
      icon="chevron-right"
      @click="nextPage"
      width="36px"
      height="36px"
      class="outline pagination-button"
    />
    <!-- TODO: Add page two -->
  </div>
</template>

<script setup>
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useSlots,
  watch,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { _isNumber } from '../utils';

import Button from './Button';
import Popup from './Popup';
import Copy from './Copy';
import Input from './Input';
import LottiePlayer from './LottiePlayer';
import TransitionExpand from './transitions/TransitionExpand';

import notFound from '../animations/not-found2.json';

const DEFAULT_POLL_INTERVAL = 10000;

const props = defineProps({
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
  paginate: { type: Boolean, default: true },
});

const store = inject('store');
const router = useRouter();
const route = useRoute();
const slots = useSlots();

let poller;

const rows = ref([]);
const table = ref(null);
const limit = ref(props.limit);
const order = ref(props.order);
const columns = ref(props.columns);
const popupActive = ref(false);
const pageInput = ref(false);
const pageInputValue = ref(null);
const initialRouteName = ref(route.name);
const pageInputRef = ref(null);

const page = computed(() =>
  _isNumber(route.query.p) ? parseInt(route.query.p) : 1,
);

const offset = computed(() => (page.value - 1) * limit.value);

const getData = async () => {
  if (typeof props.fn === 'string') {
    store.incrementLoadingCount();
    if (props.arg) {
      try {
        const result = await store.client.value[props.fn](
          props.arg,
          null,
          offset.value,
          limit.value,
          order.value,
        );
        store.decrementLoadingCount();
        return result;
      } catch (e) {
        store.decrementLoadingCount();
        throw e;
      }
    }
    try {
      const result = await store.client.value[props.fn](
        offset.value,
        limit.value,
        order.value,
      );
      store.decrementLoadingCount();
      return result;
    } catch (e) {
      store.decrementLoadingCount();
      throw e;
    }
  } else if (typeof props.fn === 'function') {
    store.incrementLoadingCount();
    try {
      const result =  await props.fn(
        props.arg,
        null,
        offset.value,
        limit.value,
        order.value,
        page.value,
      );
      store.decrementLoadingCount();
      return result;
    } catch (e) {
      store.decrementLoadingCount();
      throw e;
    }
  } else {
    throw new Error(
      `fn should be a function or string, not a ${typeof props.fn}`,
    );
  }
};

const updateRows = async () => {
  const initialPage = page.value;
  const rowData = await getData();
  if (page.value === initialPage) {
    rows.value = rowData;
  }
};

const setPoll = async () => {
  if (!props.fn) return;
  if (page.value !== 1) return;
  clearInterval(poller);
  console.debug('Start polling');
  poller = setInterval(
    updateRows,
    (store.state && store.state.config && store.state.config.pollInterval) ||
      DEFAULT_POLL_INTERVAL,
  );
  await updateRows();
};

const clearPoll = () => {
  console.debug('Stop polling');
  clearInterval(poller);
};

const updatePoll = () => {
  if (page.value === 1) {
    setPoll();
  } else {
    clearPoll();
  }
};

const handleNewRecords = async () => {
  if (!props.fn) return;
  if (page.value !== 1) return;
  await updateRows();
};

const keyEvents = (e) => {
  if (e.key === 'ArrowRight') nextPage();
  if (e.key === 'ArrowLeft') previousPage();
};

onMounted(async () => {
  // Use replace instead of push that way we can skip a page in the history
  if (props.paginate && !route.query.p)
    router.replace({ query: { ...route.query, p: 1 } });

  if (props.fn) {
    await updateRows();
    updatePoll();
  } else {
    rows.value = props.rows;
  }

  window.addEventListener('blur', clearPoll);
  window.addEventListener('focus', setPoll);
  window.addEventListener('keydown', keyEvents);
  window.addEventListener('DataTable:update', handleNewRecords);
});

onUnmounted(() => {
  clearPoll();
  window.removeEventListener('keydown', keyEvents);
  window.removeEventListener('blur', clearPoll);
  window.removeEventListener('focus', setPoll);
  window.removeEventListener('DataTable:update', handleNewRecords);
});

watch(
  () => props.rows,
  (n) => !props.fn && (rows.value = n),
);

const nextPage = async () => {
  await router.push({ query: { ...route.query, p: page.value + 1 } });
};

const previousPage = async () => {
  if (page.value === 1) return;
  await router.push({ query: { ...route.query, p: page.value - 1 } });
};

const definePage = async (p, fromInput = false) => {
  if (pageInputRef.value && fromInput) {
    await pageInputRef.value.validate();
    if (pageInputRef.value.error) return;
  }

  await router.push({ query: { ...route.query, p } });
  pageInput.value = false;
  pageInputValue.value = null;
};

const activatePageInput = () => {
  pageInput.value = true;
  nextTick(() => pageInputRef.value.focus());
};

watch(
  () => page.value,
  async () => {
    if (page.value && initialRouteName.value === route.name) {
      updatePoll();

      if (props.fn) {
        await updateRows();
      }
    }
  },
);

const sort = async (c) => {
  order.value = c.sorted === 'asc' ? 'desc' : 'asc';

  // TODO: This will be for filtering
  const index = columns.value.findIndex((e) => e.field === c.field);
  c = { ...c, sorted: order.value };
  columns.value.splice(index, 1, c);

  rows.value = await getData();
};

const mustShrink = (shrinkUntilWidth) => {
  return (
    window.innerWidth < shrinkUntilWidth ||
    table.value.scrollWidth > table.value.offsetWidth
  );
};

const getShortValue = (val, shrinkUntilWidth = 0) => {
  if (val === 0) return val.toString();
  if (!val) return;
  if (!shrinkUntilWidth) return val.toString();
  if (table.value && typeof val === 'string' && mustShrink(shrinkUntilWidth)) {
    if (val.length > 14) {
      const arr = val.split('');
      return [
        ...arr.slice(0, 6),
        '...',
        ...arr.slice(arr.length - 4, arr.length),
      ].join('');
    }
  }
  return val.toString();
};

const detail = (data) => {
  router.push(
    `/${props.prefix ? props.prefix : 'transactions'}/${
      data.id || data.address
    }`,
  );

  window.removeEventListener('keydown', keyEvents);
};

const loading = computed(() => store.state.progressBarLoading);
const togglePopup = () => (popupActive.value = !popupActive.value);
const hasHeaderSlot = !!slots.header;
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
  bottom: 25px;
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

a.pagination-button {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<style>
@media screen and (max-width: 768px) {
  .mobile-width {
    max-width: 100px;
  }
}
</style>
