const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const getDistPath = target => `${__dirname}/dist/${target}`;

const getTargetPlugins = (target) => {
  return target === 'node'
  ? [new webpack.DefinePlugin({ 'global.GENTLY': false })]
  : [];
}

const getTargetExternals = (target) => {
  return target === 'node'
    ? [nodeExternals()]
    : [];
}

const createConfig = (target) => ({
  devtool: 'source-map',
  entry: {
    'index': './src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        loader: ['babel-loader']
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  externals: getTargetExternals(target),
  output: {
    path: getDistPath(target),
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  target,
  plugins: [
    ...getTargetPlugins(target)
  ]
});

const targets = ['web', 'node'];

module.exports = () => targets.map(createConfig);
