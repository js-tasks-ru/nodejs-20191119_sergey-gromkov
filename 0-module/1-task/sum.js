function isNumber(value) {
  return (typeof value === 'number') && Number.isFinite(value);
}

function sum(a, b) {
  if (!isNumber(a) || !isNumber(b)) {
    throw new TypeError('Передан не числовой аргумент');
  }

  return a + b;
}

module.exports = sum;
