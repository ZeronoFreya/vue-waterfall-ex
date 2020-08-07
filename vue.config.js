"use strict"

module.exports = {
    // 修改 src 目录 为 examples 目录
    pages: {
        index: {
            entry: "examples/main.ts",
            template: "public/index.html",
            filename: "index.html",
        },
    },
    // 设置css: { extract: false },可以强制内联，就不会将css单独打包成一个文件，导致页面没有style
    css: { extract: false },
    productionSourceMap: false,
}
