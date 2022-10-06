<template>
  <div class="flex flex-gap pa-1 column">
    <div>
      Address:
      <Input
        class="primary-darker"
        :model-value="transfer.address.data"
        @update:model-value="
          (v) => updateModelValue({ key: 'address', value: v })
        "
        :rules="[
          (val) => !!val || (val && val.length <= 0) || 'Required',
          (val) => (val && val.length <= 44) || 'Invalid address',
        ]"
        :ref="(el) => (transfer.address.ref = el)"
      />
    </div>
    <div>
      Amount:<br />
      <small
        v-if="verifyTransferLimit"
        @click="populate"
        class="cursor-pointer"
      >
        Maximum:
        <span class="amount">
          {{ transformMonetaryUnit(decimalToInteger(maxBalance)) }}
        </span>
      </small>
      <Input
        class="primary-darker"
        :model-value="transfer.amount.data"
        @update:model-value="
          (v) => updateModelValue({ key: 'amount', value: v })
        "
        :error="transfer.amount.error"
        :suffix="unit"
        :ref="(el) => (transfer.amount.ref = el)"
        :rules="[
          (val) => !!val || (val && val.length <= 0) || 'Required',
          (val) => (val && val.split('.').length <= 2) || 'Not a valid amount',
          (val) =>
            (val && Number.isInteger(parseInt(decimalToInteger(val)))) ||
            'Not a valid amount',
          (val) =>
            parseFloat(val) <= parseFloat(maxBalance) ||
            !verifyTransferLimit ||
            'You are trying to transfer more than you have',
        ]"
      />
    </div>
    <div>
      Minimum fee:
      {{ minFee }}
      <Input
        class="primary-darker"
        :model-value="transfer.fee.data"
        @update:model-value="(v) => updateModelValue({ key: 'fee', value: v })"
        :error="transfer.fee.error"
        :suffix="unit"
        :ref="(el) => (transfer.fee.ref = el)"
        :rules="[
          (val) => !!val || (val && val.length <= 0) || 'Required',
          (val) => (val && val.split('.').length <= 2) || 'Not a valid amount',
          (val) =>
            (val && Number.isInteger(parseInt(decimalToInteger(val)))) ||
            'Not a valid amount',
          (val) => val >= minFee || `Value should not be less than ${minFee}`,
        ]"
      />
    </div>
    <div>
      Message:
      <Input
        class="primary-darker"
        :model-value="transfer.message.data"
        @update:model-value="
          (v) => updateModelValue({ key: 'message', value: v })
        "
        :error="transfer.message.error"
        :ref="(el) => (transfer.message.ref = el)"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, ref, inject } from 'vue';
import {
  _decimalToInteger,
  _integerToDecimal,
  _transformMonetaryUnit,
} from '../../utils';

import Input from '../Input';

const emit = defineEmits(['update:model-value']);

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  verifyTransferLimit: {
    type: Boolean,
    default: false,
  },
});

// console.log(props.modelValue)

const store = inject('store');

const balance = ref(null);
const minFee = ref(null);
const hasError = ref(false);

const transfer = reactive({
  address: {
    ref: null,
    data: props.modelValue.address,
  },
  amount: {
    ref: null,
    data: props.modelValue.amount,
  },
  fee: {
    ref: null,
    data: props.modelValue.fee,
  },
  message: {
    ref: null,
    data: props.modelValue.message,
  },
});

const updateModelValue = ({ key, value }) => {
  transfer[key].data = value;

  emit('update:model-value', {
    address: transfer.address.data,
    amount: transfer.amount.data,
    fee: transfer.fee.data,
    message: transfer.message.data,
  });
};

const maxBalance = computed(
  () => _integerToDecimal(balance.value) - transfer.fee.data,
);

const authenticated = computed(() => store.state.authenticated);

const populate = () => (transfer.amount.data = String(maxBalance.value));
const unit = computed(() => store.state.config.networkSymbol.toUpperCase());

const decimalToInteger = _decimalToInteger;
const transformMonetaryUnit = _transformMonetaryUnit;

onMounted(async () => {
  const { minTransactionFees } = await store.client.value.getMinFees();
  transfer.fee.data = _integerToDecimal(minTransactionFees.transfer);
  minFee.value = _integerToDecimal(minTransactionFees.transfer);

  if (authenticated.value) {
    const address = await store.client.value.getWalletAddress();

    balance.value = (await store.client.value.getAccount(address)).balance;
  }
});

const validate = () => {
  for (let i = 0; i < Object.keys(transfer).length; i++) {
    const key = Object.keys(transfer)[i];
    if (transfer[key].ref.error) {
      hasError.value = true;
      throw new Error(transfer[key].ref.error);
    }
  }
};

defineExpose({ validate, hasError });
</script>

<style lang="scss" scoped></style>
