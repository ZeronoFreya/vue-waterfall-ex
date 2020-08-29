module.exports = {
    chainWebpack: config => {
        // 为了让基于Typescript的组件生成它们的声明（.d.ts）文件
        // 详情 https://github.com/vuejs/vue-cli/issues/1081
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
    // 不生成SourceMap
    productionSourceMap: false,
    // 关闭并行打包，否则无法自动生成 `.d.ts` 文件
    parallel: false
}