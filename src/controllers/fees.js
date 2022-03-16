const joi = require('joi');
const Fee = require('../models/fee');
const ApiError = require('../api-error');
const parseSpec = require('../helpers/parser');
const { locales } = require('../helpers/constants');
const { calculateCharge, normalizeValue } = require('../helpers/charges');
const { add, subtract, toUnit } = require('dinero.js');

const validateFeeRequestBody = (obj) => {
  const schema = joi.object().keys({
    FeeConfigurationSpec: joi.string().required()
  }).required();

  return schema.validate(obj);
};

const postFee = async (req, res, next) => {
  try {
    const { error } = validateFeeRequestBody(req.body);
    if (error) throw new ApiError(error.details[0].message, 400);

    const { FeeConfigurationSpec } = req.body;
    const specs = FeeConfigurationSpec.split('\n');

    const docs = specs.map(parseSpec);
    await Fee.insertMany(docs).catch(console.error);
    res.status(201).json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
};

const computeTransactionFee = async (req, res, next) => {
  try {
    const { Amount, Currency, CurrencyCountry, Customer, PaymentEntity } = req.body;
    const { BearsFee } = Customer;
    const { ID, Issuer, Brand, Number: number, SixID, Type, Country } = PaymentEntity;

    const locale = CurrencyCountry == Country ? locales.LOCL : locales.INTL;

    const configs = await Fee.find({
      currency: Currency,
      locale: {
        $in: [locale, '*']
      },
      entity: {
        $in: [Type, '*']
      },
      entityProperty: {
        $in: [ID, Issuer, Brand, number, SixID, '*']
      }
    });

    if (!configs.length) {
      throw new ApiError(
        `No fee configuration for ${Currency} transactions.`,
        400
      );
    }
    
    const validConfig = configs[0];
    const { feeId, value, type } = validConfig;
    const amount = normalizeValue(Amount.toString());
  
    const AppliedFeeValue = calculateCharge({
      feeType: type,
      value,
      amount
    });

    const ChargeAmount = BearsFee ? add(amount, AppliedFeeValue) : amount;
    const SettlementAmount = subtract(ChargeAmount, AppliedFeeValue);

    res.json({
      AppliedFeeID: feeId,
      AppliedFeeValue: toUnit(AppliedFeeValue),
      ChargeAmount: toUnit(ChargeAmount),
      SettlementAmount: toUnit(SettlementAmount)
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  postFee,
  computeTransactionFee
};