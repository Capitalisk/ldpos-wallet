export const _decimalToInteger = amount =>
  amount !== '' && Math.floor(parseFloat(amount) * 100000000).toString();

export const _integerToDecimal = amount => {
  if (!Number.isInteger(Number(amount))) {
    return '';
  }
  const parsedAmount = parseInt(amount);
  const calculatedAmount = parsedAmount / 100000000;

  return calculatedAmount.toString();
};

export const _parseDate = d => {
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
  amount
    ? `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(_integerToDecimal(amount))} ${symbol.toUpperCase()}`
    : null;

export const _splitCamelCaseWords = str => {
  if (typeof str !== 'string') return [];
  return str.replace(/([A-Z]+|[A-Z]?[a-z]+)(?=[A-Z]|\b)/g, '!$&').split('!');
};

export const _capitalize = str =>
  str.replace(/(?:^|\s|[-"'([{])+\S/g, c => c.toUpperCase());

export const _pluralToSingular = str => str.slice(0, -1);
