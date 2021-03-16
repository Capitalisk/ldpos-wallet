<template>
  <div class="table flex column fixed-height">
    <div class="header">
      <slot name="header" class="pa-2" />
      <h2 v-if="title" class="pa-2">{{ title }}</h2>
    </div>
    <div class="overflow-x overflow-y flex flex-wrap column" id="table">
      <table>
        <thead>
          <th v-for="(c, i) in columns" :key="i">{{ c.label }}</th>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td v-for="(c, i) in columns" :key="i">
              {{ c.value ? c.value(r[c.field]) : r[c.field] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <slot name="header" class="pa-2" />
      <h2 v-if="title" class="footer-title pa-2">{{ title }}</h2>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'DataTable',
  props: {
    rows: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    title: { type: String },
  },
  setup(props, { emit }) {
    const store = useStore();

    return {};
  },
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
  background-color: #d6dee1;
  border-radius: 20px;
  border: 6px solid transparent;
  background-clip: content-box;
}

#table::-webkit-scrollbar-thumb:horizontal {
  height: 20px;
}

#table::-webkit-scrollbar-thumb:hover {
  background-color: #a8bbbf;
}

#table::-webkit-scrollbar-corner {
  display: none;
}
</style>
