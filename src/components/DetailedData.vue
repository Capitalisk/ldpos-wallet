<template>
  <div class="flex column fullwidth">
    <hr />
    <template v-for="(value, key) in data" :key="key">
      <div v-if="!Array.isArray(value)" class="flex column my-2">
        <div class="title">
          <strong>{{ transformTitle(key) }}</strong>
        </div>
        <div>
          {{ transformValue(key, value) || '-' }}
        </div>
      </div>
      <div v-else class="my-2">
        <div class="title">
          <strong>{{ transformTitle(key) }}</strong>
        </div>
        <div>
          <div v-for="(a, i) in value" :key="i">
            <template v-for="(v, k) in a" :key="k">
              <div class="flex">
                <div class="flex-2">
                  <strong class="subtitle">{{ transformTitle(k) }}:</strong>
                </div>
                <div class="flex-9">
                  {{ v ? v : '-' }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <hr />
    </template>
  </div>
</template>

<script>
import {
  _parseDate,
  _transformMonetaryUnit,
  _splitCamelCaseWords,
  _capitalize,
} from '../utils';

export default {
  name: 'DetailedData',
  props: {
    data: { type: Object, default: {} },
  },
  setup(props) {
    const titleTransformations = {
      timestamp: 'Date',
    };

    const valueTransformations = {
      timestamp: (val) => _parseDate(val),
      amount: (val) => _transformMonetaryUnit(val),
      fee: (val) => _transformMonetaryUnit(val),
      type: (val) => _capitalize(_splitCamelCaseWords(val).join(' ')),
    };

    const transformTitle = (key) =>
      titleTransformations[key] || _splitCamelCaseWords(key).join(' ');

    const transformValue = (key, value) =>
      valueTransformations[key] ? valueTransformations[key](value) : value;

    return {
      transformTitle,
      transformValue,
    };
  },
};
</script>

<style scoped>
.title {
  font-size: 13px;
  text-transform: capitalize;
}

.subtitle {
  font-size: 12px;
  text-transform: capitalize;
}
</style>