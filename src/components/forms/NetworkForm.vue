<template>
  <div v-if="!edit">
    <div class="mb-1">
      Network Symbol
    </div>
    <div class="mb-2">
      <Input
        v-bind="$attrs"
        v-model="config.networkSymbol"
        :ref="el => (validationRefs.networkSymbol = el)"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div v-if="isDevelopment && !edit">
    <div class="mb-1">
      Type:
    </div>
    <div class="mb-2">
      <Select
        v-bind="$attrs"
        v-model="type"
        :options="['mainnet', 'testnet']"
      />
    </div>
  </div>
  <div>
    <div class="mb-1">
      Hostname
    </div>
    <div class="mb-2">
      <Input
        v-bind="$attrs"
        v-model="config.hostname"
        :ref="el => (validationRefs.hostname = el)"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div>
    <div class="mb-1">
      Port
    </div>
    <div class="mb-2">
      <Input
        v-bind="$attrs"
        v-model="config.port"
        :ref="el => (validationRefs.port = el)"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div>
    <div class="mb-1">
      Chain Module Name
    </div>
    <div class="mb-2">
      <Input
        v-bind="$attrs"
        v-model="config.chainModuleName"
        :ref="el => (validationRefs.chainModuleName = el)"
        :rules="[val => !!val || (val && val.length <= 0) || 'Required']"
      />
    </div>
  </div>
  <div>
    <div class="mb-1">
      WSS <tooltip content="The majority of cases this will need to be unchecked. If you don't know, leave it unchecked." />
    </div>
    <div class="mb-2">
      <Switch v-model="config.secure" />
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';

import Input from '../Input';
import Select from '../Select';
import Switch from '../Switch';
import Tooltip from '../Tooltip';

export default {
  name: 'NetworkForm',
  components: { Input, Select, Switch, Tooltip },
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
    edit: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const validationRefs = reactive({
      networkSymbol: null,
      hostname: null,
      port: null,
      chainModuleName: null,
    });

    const type = ref('mainnet');

    const validate = async () => {
      let hasErrors = false;
      const values = Object.values(validationRefs);
      for (let i = 0; i < values.length; i++) {
        const v = values[i];
        await v.validate();
        if (v.error) hasErrors = true;
      }
      return Promise.resolve(hasErrors);
    };

    return {
      type,
      validationRefs,
      validate,
      isDevelopment: process.env.NODE_ENV === 'development',
    };
  },
};
</script>
