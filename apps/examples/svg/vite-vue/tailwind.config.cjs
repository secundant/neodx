const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

// Tailwind's colors are nested ({ red: { 50: '...', ... } }), so we need to flatten them
const flatColors = (colors, prefix = '') =>
  Object.assign(
    {},
    ...Object.entries(colors).map(([key, value]) =>
      typeof value === 'object'
        ? flatColors(value, `${prefix}${key}-`)
        : { [`${prefix}${key}`]: value }
    )
  );

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          // set the css variable with the value of the color
          'icon-secondary': value => ({
            '--icon-secondary-color': value
          })
        },
        // all possible values are all colors from the theme
        { values: flatColors(theme('colors')) }
      );
    })
  ]
};
