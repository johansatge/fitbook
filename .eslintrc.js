module.exports = {
  env: {
    browser: true,
    node: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended'],
  parser: 'babel-eslint',
  rules: {
    'prettier/prettier': 'error',
    'no-console': ['error'],
    'no-debugger': ['error'],
    'no-else-return': ['error'],
    'no-undef': ['error'],
    'no-unused-vars': ['error'],
    'no-var': ['error'],
    'prefer-const': ['error'],
    'prefer-template': ['warn'],
    'react/prop-types': ['off'],
  },
}
