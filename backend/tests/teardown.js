const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // Stop the in-memory server
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }

  // Clean up the config file
  const globalConfigPath = path.join(__dirname, 'globalConfig.json');
  if (fs.existsSync(globalConfigPath)) {
    fs.unlinkSync(globalConfigPath);
  }
};