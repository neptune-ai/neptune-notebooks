const config = {
  'presets': [
    [
      '@babel/preset-env',
      {
        // This option enables a new plugin that adds proper pollyfils
        // from core-js based on usage in our code
        'useBuiltIns': 'usage',

        // tell babel which version of core-js is installed so it can make proper pollyfil imports
        'corejs': 3,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  'plugins': [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
};

module.exports = config;
