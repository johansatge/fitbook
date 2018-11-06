module.exports = {
  env: {
    browser: true,
    node: true,
  },
  plugins: ['prettier'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended', // Makes eslint understand JSX modules import
  ],
  parser: 'babel-eslint', // Makes eslint understand JSX statements
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
  settings: {
    react: {
      pragma: 'h', // Preact JSX pragma
      version: '15.0', // React version, useless with Preact but eslint emits a warning otherwise
    },
  },
}
