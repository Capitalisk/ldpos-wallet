export const _decimalToInteger = (amount) =>
  amount !== '' && (parseFloat(amount) * 100000000).toString();

export const _integerToDecimal = (amount) =>
  Number.isInteger(parseInt(amount))
    ? amount !== '' && (parseInt(amount) / 100000000).toFixed(2).toString()
    : '';

export const _parseDate = (d) => {
  if (!d) return;
  d = new Date(d);
  const today = new Date();

  const isToday =
    d.getDate() == today.getDate() &&
    d.getMonth() == today.getMonth() &&
    d.getFullYear() == today.getFullYear();

  const options = {
    timeStyle: 'short',
  };

  if (!isToday) options.dateStyle = 'short';

  return new Intl.DateTimeFormat('nl-BE', options).format(d);
};

export const _transformMonetaryUnit = (amount, symbol = 'CLSK') =>
  amount ? `${_integerToDecimal(amount)} ${symbol.toUpperCase()}` : null;
