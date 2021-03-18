<template>
  <div class="table flex column fixed-height">
    <div class="header">
      <slot name="header" class="pa-2" />
      <h2 v-if="title" class="pa-2">{{ title }}</h2>
    </div>
    <div class="overflow-x overflow-y flex flex-wrap column pb-2" id="table">
      <table>
        <thead>
          <th v-for="(c, i) in columns" :key="i" class="pa-4 text-left">{{ c.label }}</th>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td v-for="(c, i) in columns" :key="i" :class="c.class || 'pa-4 mr-2'">
              <div
                class="ellipsis"
                :data-final-characters="
                  getFinalCharacters(
                    c.value ? c.value(r[c.field], r) : r[c.field],
                  )
                "
                @load="getWidth($event)"
              >
                <p>
                  {{ c.value ? c.value(r[c.field], r) : r[c.field] }}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <div v-if="loading">
        <Loading />
      </div>
      <slot name="header" class="pa-2" />
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';

import Loading from '../parts/Loading';

export default {
  name: 'DataTable',
  props: {
    rows: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    title: { type: String },
    loading: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    onMounted(() => {
      const table = document.getElementById('table');
      table.addEventListener('scroll', (event) => {
        if (table.scrollTop >= table.scrollHeight - table.offsetHeight - 20)
          emit('get-data');
      });
    });

    return {
      getFinalCharacters: (val) =>
        typeof val === 'string' ? val.slice(-3) : null
        ,
      getWidth: (e) => {
        console.log(e)
        debugger;
      },
    };
  },
  components: { Loading },
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
}

.ellipsis {
  max-width: 20vw;
  position: relative;
}

.ellipsis > p {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: calc(100% - 26px);
}

.ellipsis:after {
  content: attr(data-final-characters);
  position: absolute;
  right: 2px;
  top: 0;
  z-index: 999;
}

tr:hover {
  background-color: var(--primary-darker);
  color: var(--permanent-white);
}

th {
  font-size: 14px;
}
</style>
