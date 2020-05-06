// Override the CRA config
// Doc: https://github.com/sharegate/craco/blob/master/packages/craco/README.md#configuration-overview
module.exports = function ({ env }) {
  return {
    eslint: {
      configure: {
        rules: {
        },
      },
    },
    babel: {
      plugins: [
        '@babel/plugin-proposal-optional-chaining',
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
      ],
    },
    style: {
      postcss: {
        mode: 'extends',
        plugins: [
          require('postcss-import'),
          require('tailwindcss')('./tailwind.config.js'),
          require('postcss-nested'),
          require('autoprefixer'),
          require('postcss-preset-env')({ stage: 1 }),
        ],
      },
    },
    webpack: {
      plugins: []
    }
  }
}
