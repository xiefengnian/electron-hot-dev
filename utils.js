const { join } = require('path');

const getConfig = () => {
  const config = require(join(__dirname, './dist/config.js')).default || {};
  return config;
};

module.exports = {
  getConfig,
};
