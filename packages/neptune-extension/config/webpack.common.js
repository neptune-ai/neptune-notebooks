// Libs
const webpack = require('webpack');


// Module
module.exports = function ({ mode, platform, project }) {
  return {
    mode,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          enforce: 'pre',
          use: [ 'eslint-loader' ],
          include: [
            project.src.resolve(),
          ],
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          use: [ 'babel-loader' ],
          include: [
            project.src.resolve(),
          ],
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
              },
            },
          ],
        },
        {
          test: /\.svg?$/,
          use: [ 'file-loader' ],
          include: [
            project.home.resolve('node_modules'),
          ],
        },
        {
          test: /\.svg?$/,
          use: [{
            loader: 'url-loader',
            options: {
              limit: 8000, // Convert images < 8kb to base64 strings
              name: 'images/[hash]-[name].[ext]',
            },
          }],
          include: [
            project.src.resolve(),
          ],
        },
      ],
    },
    resolve: {
      modules: ['src', 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        src: project.src.resolve(),
        platform: project.src.resolve(platform),
      },
    },
    plugins: [
      /*
       * Strip development code from react.
       */
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: mode,
        },
        'NEPTUNE_BUILD_DATE': JSON.stringify(new Date()),
      }),
    ],
    // TODO: probably should be depenand of build mode
    optimization: {
      minimize: false,
    },
  };
};
