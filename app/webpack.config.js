const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')
const webpack = require('webpack')

module.exports = ({ dropboxAppKey, ejsTemplates }) => {
  const defines = {
    __DROPBOX_APP_KEY__: JSON.stringify(dropboxAppKey),
  }
  Object.keys(ejsTemplates).forEach((templateName) => {
    defines[`__EJS_${templateName.toUpperCase()}__`] = ejsTemplates[templateName]
  })
  return {
    mode: 'production',
    entry: {
      index: path.join(__dirname, 'index.js'),
      login: path.join(__dirname, 'login.js'),
    },
    output: {
      path: path.join(__dirname, '../.dist'),
      filename: '[name].[chunkhash].js',
      library: ['Scripts', '[name]'],
      libraryTarget: 'var',
    },
    performance: {
      maxEntrypointSize: 500000,
      maxAssetSize: 500000,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [__dirname],
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      ],
    },
    resolve: {
      alias: {
        // materialize: path.resolve(__dirname, '..', 'node_modules/materialize-css/dist/js/materialize.js'),
      },
    },
    plugins: [
      new webpack.DefinePlugin(defines),
      new BundleAnalyzerPlugin({
        analyzerMode: 'disabled',
        reportFilename: path.join(__dirname, '../.dist/bundle.analyze.html'),
        openAnalyzer: false,
        logLevel: 'silent',
      }),
    ],
  }
}
