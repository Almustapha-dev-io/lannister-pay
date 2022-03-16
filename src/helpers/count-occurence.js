const countOccurence = ({ regex, str }) => {
  if (!(regex instanceof RegExp)) throw new Error('"regex" must be a valid regular expression');
  if (typeof str !== 'string') throw new Error('"str" must be a string value.');

  return (str.match(regex) || []).length;
};

module.exports = countOccurence;