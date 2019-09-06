/* eslint no-console:0 */

// Libs
const merge = require('webpack-merge');


// Config
const project = require('./config/project');


// Module
const MODES = {
  dev: 'development',
  dist: 'production',
};
const DEFAULT_MODE = 'dev';

const PLATFORMS = {
  lab: 'labextension',
  nb: 'nbextension',
};

function validate(value, validValues, defaultValue) {
  return validValues[value] || defaultValue && validValues[defaultValue];
}


module.exports = function (env, argv = {}) {
  const mode = validate(env, MODES, DEFAULT_MODE);
  const platform = validate(argv.platform, PLATFORMS);

  if (!platform) {
    console.log('Invalid target platform:', argv.platform);
    return 1;
  }

  const baseConfig = require(project.config.resolve('webpack.common'));
  const targetConfig = require(project.config.resolve(`webpack.${platform}`));
  const buildParams = {
    mode,
    platform,
    project,
  };

  const config = merge(
    baseConfig(buildParams),
    targetConfig(buildParams),
  );

  if (argv.debug) {
    console.log('%s: %s', 'Build params', JSON.stringify(buildParams, null, 2), '\n');
    console.log('%s: %s', 'Webpack final config', JSON.stringify(config, null, 2), '\n');
  }

  return config;
};
