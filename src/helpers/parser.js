/* 
  Replace all occurrences of ' : ' with ''
  Replace all occurrences of '(' and ')' with ' '
*/
const formatSpec = (str) => {
  return str
    .replaceAll(/[(|)]/g, ' ')
    .replaceAll(/[' ']:[' ']/g, '');
};


// Split string and return object of properties
const getProperties = (str) => {
  const [feeId, currency, locale, entity, entityProperty, _, type, value] = str.split(' ');
  return { 
    feeId, 
    currency, 
    locale, 
    entity, 
    entityProperty, 
    type, 
    value
  };
};

const parseSpec = (configuration) => {
  const Fee = require('../models/fee');
  const formattedSpec = formatSpec(configuration);
  const properties = getProperties(formattedSpec);
  return new Fee({...properties, configuration }).json;
};

module.exports = parseSpec;