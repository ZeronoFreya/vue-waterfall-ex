"use strict"

module.exports = {
  // 修改 src 目录 为 examples 目录
  pages: {
      index: {
          entry: "examples/main.ts",
          // 模板来源
          template: 'public/index.html',
          // 输出文件名
          filename: 'index.html'
      },
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.module.rule('ts').uses.delete('cache-loader');

      config.module
        .rule('ts')
        .use('ts-loader')
        .loader('ts-loader')
        .tap((opts) => {
          opts.transpileOnly = false;
          opts.happyPackMode = false;
          return opts;
        });
    }
  },
  // 设置css: { extract: false },可以强制内联，就不会将css单独打包成一个文件，导致页面没有style
  css: { extract: false },
  productionSourceMap: false,
  parallel: false
}
