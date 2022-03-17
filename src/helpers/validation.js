const joi= require('joi');

const numberOrString = () => {
  return joi.alternatives().try(
    joi.number(), 
    joi.string()
  );
};

const validateFeeRequestBody = (obj) => {
  const schema = joi.object().keys({
    FeeConfigurationSpec: joi.string().required()
  }).required();

  return schema.validate(obj);
};


module.exports = {
  validateFeeRequestBody
};