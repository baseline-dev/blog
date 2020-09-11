const { purge } = require('tailwindcss/stubs/defaultConfig.stub');

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')('./tailwind.config.js'),
    require('autoprefixer')
  ]
};