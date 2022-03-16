
const formatSpec = (str) => {
  if (typeof str !== 'string') throw new Error('"str" must be a string');
  return str
    .replaceAll(/[(|)]/g, ' ')
    .replaceAll(/[' ']:[' ']/g, '');
};


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