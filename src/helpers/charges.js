const { feeTypes } = require('./constants');
const { dinero, add, multiply, subtract, toUnit } = require('dinero.js');
const { NGN } = require('@dinero.js/currencies');

/**
 * Accepts a number as a string format
 * and counts the decimal places.
 * 
 * @param {String} value The number in string format
 * @returns 
 */
const getDecimalPlaceCount = (value) => {
  if (typeof value !== 'string') throw new Error('"value" must be a string.');
  if (isNaN(+value)) throw new Error('value is not a number');
  const [_, decimal] = value.split('.');
  return decimal ? decimal.length : 0;
};

/**
 * Accepts a number as a string format
 * and scales to an integer based on percentage
 * 
 * @param {String} value The number in string format
 * @returns 
 */
const getPercentageScale = (value) => {
  if (typeof value !== 'string') throw new Error('"value" must be a string.');
  const decimalPlaces = getDecimalPlaceCount(value);
  /**
   * Add 2 to the decimal places because we are
   * working with percentages
   */
  return decimalPlaces + 2;
};

/**
 * Convert a number to its equivalent minor value
 * e.g NGN50 == 50000
 * 
 * @param {Object} param The object param
 * @param {Number} param.value The number value
 * @param {Number} param.decimalPlaces The decimal places for the number in value
 * @param {Number} param.exponent The exponent value
 * @returns 
 */
const valueToMinorValue = ({ value, decimalPlaces, exponent }) => {
  if (typeof value !== 'number') throw new Error('"value" must be a valid number.');
  if (typeof decimalPlaces !== 'number') throw new Error('"exponent')
  if (exponent && typeof exponent !== 'number') throw new Error('"exponent" must be a valid number')
  if (!exponent) {
    exponent = 0;
  }
  return value * 10 ** (decimalPlaces + exponent);
}

/**
 * Accepts a number in string format
 * and converts it to a Dinero object
 * 
 * @param {String} value The number in string 
 * @returns 
 */
const normalizeValue = (value) => {
  const decimalPlaces = getDecimalPlaceCount(value);
  const amount = valueToMinorValue({
    decimalPlaces,
    value: +value,
    exponent: NGN.exponent
  });
  return dinero({ amount, currency: NGN });
};

/**
 * Accepts a number in string format and
 * converts it to a Dinero equivalent
 * 
 * @param {String} value 
 * @returns 
 */
const normalizePercentage = (value) => {
  const decimalPlaces = getDecimalPlaceCount(value);
  const scale = getPercentageScale(value);
  const amount = valueToMinorValue({
    value: +value,
    decimalPlaces
  })
  return { amount, scale };
};


/**
 * Accepts an object with param.amount
 * and a param.value in string format.
 * Uses param.value to calculat charge on amount.
 * 
 * @param {Object} param 
 * @param {import('dinero.js').Dinero} param.amount
 * @param {String} param.value
 * @returns 
 */
const calculateFlatCharge = ({ amount, value }) => {
  return add(amount, normalizeValue(value));
};

/**
 * Accepts an object with param.amount
 * and a param.value in string format.
 * Uses param.value to calculate percentage charge on amount
 * 
 * @param {Object} param 
 * @param {import('dinero.js').Dinero} param.amount
 * @param {String} param.value
 * @returns 
 */
const calculatePercentageCharge = ({ amount, value }) => {
  return multiply(amount, normalizePercentage(value));
}

/**
 * Accepts custom param.value in format 'flat:percentage'
 * and param.amount. Uses param.value to calculate
 * charge on amount.
 * 
 * @param {Object} param 
 * @param {import('dinero.js').Dinero} param.amount
 * @param {String} param.value 
 * @returns 
 */
const calculateFlatPercentageCharge = ({ amount, value }) => {
  const [flat, percentage] = value.split(':');
  const normalizedFlatCharge = normalizeValue(flat);
  const normalizedPercentageCharge = normalizePercentage(percentage);
  return add(
    normalizedFlatCharge,
    multiply(amount, normalizedPercentageCharge)
  );
}

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const calculateCharge = ({ feeType, value, amount }) => {
  if (!feeTypes[feeType]) throw new Error(`"${feeType}" is not a valid fee type.`);
  const funcs = {
    [feeTypes.FLAT]: calculateFlatCharge,
    [feeTypes.PERC]: calculatePercentageCharge,
    [feeTypes.FLAT_PERC]: calculateFlatPercentageCharge
  };
  return funcs[feeType]({ amount, value });
};

module.exports = {
  calculateCharge,
  normalizePercentage,
  normalizeValue
};