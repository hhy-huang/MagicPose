module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint", 
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: "./tsconfig.json"
  },
  env: {
    'es5': true,
    'es6': true,
    'node': true,
    'jest': true
  },
  rules: {
    // 箭头函数中，在需要的时候，在参数外使用小括号（只有一个参数时，可以不适用括号，其它情况下都需要使用括号）
    'arrow-parens': 'off',
    'prefer-const': 'off',
    'prefer-rest-params': 'off',
    'comma-dangle': [
      'error',
      'only-multiline'
    ],
    'no-var': 'off',
    'complexity': ['error', 50],
    'func-names': 'off',
    'global-require': 'off',
    'quotes': 'off',
    'handle-callback-err': [
      'error',
      '^(err|error)$'
    ],
    'import/no-unresolved': [
      'off',
      {
        'caseSensitive': true,
        'commonjs': true,
        'ignore': ['^[^.]']
      }
    ],
    'space-before-function-paren': 'off',
    'import/prefer-default-export': 'off',
    'linebreak-style': 'off',
    'no-catch-shadow': 'error',
    'no-continue': 'off',
    'no-div-regex': 'warn',
    'no-unused-vars': 'off',
    'no-else-return': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-trailing-spaces': 'off',
    'no-control-regex': 'off',
    'no-cond-assign': 'off',
    'space-infix-ops': 'off',
    'no-shadow': 'off',
    'no-multi-assign': 'off',
    'no-multiple-empty-lines': 'off',
    'no-underscore-dangle': 'off',
    'node/no-deprecated-api': 'error',
    'node/process-exit-as-throw': 'error',
    'object-curly-spacing': [
      'off',
      'never'
    ],
    'operator-linebreak': [
      'error',
      'after',
      {
        'overrides': {
          ':': 'before',
          '?': 'before'
        }
      }
    ],
    'yoda': 'off',
    'no-proto': 'off',
    'prefer-arrow-callback': 'off',
    'prefer-destructuring': 'off',
    'prefer-template': 'off',
    'quote-props': [
      1,
      'as-needed',
      {
        'unnecessary': true
      }
    ],
    'semi': ['off', 'never'],

    // 补充规则
    'max-len': 'off',
    'eol-last': 'off',
    'spaced-comment': 'off',
    'no-multi-spaces': 'off',
    "no-console": ["warn", { "allow": ["debug", "info", "warn", "error"] }],
    //使用=== !== 代替== != .
    "eqeqeq": ["warn", "always"],
    "no-useless-constructor": "off",
    "no-undef": 'off',
    "no-redeclare": 'off',
    "padded-blocks": 'off',
    "dot-notation": 'off',
    "no-inner-declarations": 'off',
    "no-use-before-define": 'off',

    "standard/no-callback-literal": "off",

    "@typescript-eslint/indent": ["error", 2, { "VariableDeclarator": 2, "SwitchCase": 1 }],
    "@typescript-eslint/no-unused-vars": ["off", {
        "vars": "all",
        "args": "none",
        "ignoreRestSiblings": true
      }],
    "@typescript-eslint/explicit-member-accessibility": ["off", {"accessibility": "no-public"}],
    "@typescript-eslint/explicit-function-return-type": ["off",
      {
        "allowExpressions": true,
        "allowTypedFunctionExpressions": true
      }],
    "@typescript-eslint/no-this-alias": [
      "error",
      {
        "allowDestructuring": true, // Allow `const { props, state } = this`; false by default
        "allowedNames": ["self"] // Allow `const self = this`; `[]` by default
      }
    ],
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-parameter-properties": 0,
    "@typescript-eslint/camelcase": ["off", {"properties": "always"}],
    "@typescript-eslint/no-inferrable-types": 'off',
    "@typescript-eslint/no-non-null-assertion": 'off',
    "@typescript-eslint/no-object-literal-type-assertion": 'off',
    "@typescript-eslint/ban-ts-comment": 'off',
    "@typescript-eslint/ban-types": 'off',
    "@typescript-eslint/explicit-module-boundary-types": 'off',
    "@typescript-eslint/no-empty-function": 'off',
    "@typescript-eslint/no-namespace": 'off',
    "@typescript-eslint/no-var-requires": 'off',
    "@typescript-eslint/no-empty-interface": 'off',
  },
  globals: {
    'window': true,
    'document': true,
    'App': true,
    'Page': true,
    'Component': true,
    'Behavior': true,
    'wx': true,
    'getCurrentPages': true,
    "getApp": true
  }
}