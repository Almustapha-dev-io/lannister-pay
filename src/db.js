const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async (dbURL) => {
  try {
    const client = await MongoClient.connect(dbURL);
    _db = client.db();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getDb = () => {
  if (!_db) throw new Error('No database found.');
  return _db;
};

const createIndexes = async () => {
  if (!_db) throw new Error('No database found.');
  try {
    await _db.collection('fees').createIndex({
      currency: 1,
      locale: 1,
      entity: 1,
      entityProperty: 1,
      priority: 1
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

module.exports = { 
  mongoConnect,
  getDb,
  createIndexes
};