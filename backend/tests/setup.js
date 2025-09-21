const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Store the URI and instance for the teardown script
  const globalConfigPath = path.join(__dirname, 'globalConfig.json');
  fs.writeFileSync(globalConfigPath, JSON.stringify({ mongoUri: uri }));

  // Set the MONGO_URI for the test environment
  process.env.MONGO_URI = uri;

  // Store mongod instance so we can stop it later
  global.__MONGOD__ = mongod;
};