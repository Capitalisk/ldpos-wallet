export const _decimalToInteger = (amount) =>
  amount !== '' && (parseFloat(amount) * 100000000).toString();

export const _integerToDecimal = (amount) =>
  Number.isInteger(parseInt(amount))
    ? amount !== '' && (parseInt(amount) / 100000000).toString()
    : '';
