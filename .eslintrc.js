module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "no-unused-vars": "off",
    // 不检测语句末尾的分号
    "semi": ["off", "always"],
    // 强制缩进为2个空格
    "indent": ["warn", 2],
    // 关闭函数名称跟括号之间的空格检测
    "space-before-function-paren": 0,
    // 忽略大括号内的空格
    "object-curly-spacing": 0,
    "@typescript-eslint/no-this-alias": 0
  }
}
