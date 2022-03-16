const countOccurence = require('../helpers/count-occurence');
const { getDb } = require('../db');

class Fee {
  constructor({ 
    feeId, 
    currency, 
    locale, 
    entity,
    entityProperty, 
    type, 
    value, 
    configuration 
  }) {
    this.feeId = feeId;
    this.currency = currency;
    this.locale = locale;
    this.entity = entity;
    this.entityProperty = entityProperty;
    this.type = type;
    this.value = value;
    this.configuration = configuration;

    this.setPriority();
  }

  setPriority() {
    const REGEXP = /\*/g;
    this.priority = countOccurence({
      regex: REGEXP,
      str: this.configuration
    });
  }

  static async insertMany(docs) {
    if (!(docs instanceof Array)) throw new Error('"docs" must be an array.');
    const db = getDb();
    return await db.collection('fees').insertMany(docs);
  }

  static async find(query) {
    if (!query) {
      query = {};
    }
    const db = getDb();
    return await db.collection('fees').find(query).sort('priority').toArray();
  }

  get json() {
    return {
      feeId: this.feeId,
      currency: this.currency,
      locale: this.locale,
      entity: this.entity,
      entityProperty: this.entityProperty,
      type: this.type,
      value: this.value,
      configuration: this.configuration,
      priority: this.priority
    }
  }
}

module.exports = Fee;