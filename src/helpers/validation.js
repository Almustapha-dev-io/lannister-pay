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

const validateComputationBody = (obj) => {
  const schema = joi.object().keys({
    ID: numberOrString(),
    Amount: joi.number().required(),
    Currency: joi.string().required(),
    CurrencyCountry: joi.string().required(),
    Customer: joi.object().keys({
      ID: numberOrString(),
      EmailAddress: joi.string(),
      FullName: joi.string(),
      BearsFee: joi.boolean().required()
    }).required(),
    PaymentEntity: joi.object().keys({
      ID: numberOrString(),
      Issuer: joi.string(),
      Brand: joi.string(),
      Number: joi.string(),
      SixID: numberOrString(),
      Type: joi.string(),
      Country: joi.string()
    })
  }).required();
  return schema.validate(obj);
};

module.exports = {
  validateComputationBody,
  validateFeeRequestBody
};