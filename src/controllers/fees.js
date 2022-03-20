const { add, subtract, toUnit } = require('dinero.js');
const Fee = require('../models/fee');
const ApiError = require('../api-error');
const parseSpec = require('../helpers/parser');
const { locales } = require('../helpers/constants');
const { calculateCharge, normalizeValue } = require('../helpers/charges');
const { validateFeeRequestBody } = require('../helpers/validation');

const postFee = async (req, res, next) => {
  try {
    const { error } = validateFeeRequestBody(req.body);
    if (error) throw new ApiError(error.details[0].message, 400);

    const { FeeConfigurationSpec } = req.body;
    const specs = FeeConfigurationSpec.trim().split('\n');
    const docs = specs.map(parseSpec);
    await Fee.insertMany(docs);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
};

const computeTransactionFee = async (req, res, next) => {
  try {
    const { Amount, Currency, CurrencyCountry, Customer, PaymentEntity } = req.body;
    const { BearsFee } = Customer;
    const { ID, Issuer, Brand, Number: number, SixID, Type, Country } = PaymentEntity;

    if (Amount <= 0) throw new ApiError('Invalid amount', 400);

    const locale = CurrencyCountry == Country ? locales.LOCL : locales.INTL;
    const configs = await Fee.find({
      currency: Currency,
      locale: { $in: [locale, '*'] },
      entity: { $in: [Type, '*'] },
      entityProperty: { $in: [ID, Issuer, Brand, number, SixID, '*'] }
    });

    if (!configs.length || Currency !== 'NGN') {
      throw new ApiError(`No fee configuration for ${Currency} transactions.`, 400);
    }
    
    const { feeId, value, type: feeType } = configs[0];
    const amount = normalizeValue(Amount.toString());
  
    const AppliedFeeValue = calculateCharge({ feeType, value, amount });

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

const flush = async (req, res, next) => {
  try {
    await Fee.flush();
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  postFee,
  flush,
  computeTransactionFee
};