# vue-waterfall-ex

## 说明
参考
* [vue-virtual-collection](https://zhuanlan.zhihu.com/p/34380557)
* [vue-waterfall-easy](https://lfyfly.github.io/vue-waterfall-easy/demo/#/)

**vue-virtual-collection** 实现了局部渲染和DOM回收，不会渲染全部数据，而是把当前 viewport 中展示的 Cell 渲染出来，所以性能上比渲染全量数据要快太多了（摘自官网）。
**vue-waterfall-easy** 则封装了瀑布流组件，使用起来十分容易。
以上两个是十分优秀的瀑布流相关组件，本着学习的态度观摩了下源码，遗憾的是并没有发现结合两者的办法。

所以本人就拆出了源码中的核心部分并重组，基本实现了组件的合并。
当然，由于本人能力有限，会有一些考虑不当的地方，欢迎指出。

## 安装

```
yarn add vue-waterfall-ex
```
## 使用方法

### 全局引入

```
// main.js

import VueWaterfallEx from 'vue-waterfall-ex';
Vue.use(VueWaterfallEx)
```
### 在组件中使用

```javascript
<template lang="pug">
  .home
    vue-waterfall-ex(
      :imgsArr="imgsArr"    // 瀑布流数据 —— 必填
      :maxCols="3"          // 最多列数
      :imgWidth="300"       // 每列的基础宽度
      srcKey="preview"      // 自定义图片地址的key值
      @scrollReachBottom="getData"  // 滚动到底部获取更多数据
    )
      template(v-slot="{data}")
        .ctrl-box                   // 自定义内容
          .xxx {{data.id}}
</template>
<script>
export default{
    data() {
      return {
        imgsArr: []
      };
    },
    created() {
      this.getData();
    },
    methods: {
      getData() {
        this.$axios.get("图片地址接口").then(res => {
          res = res.data;
          let imgList = [];
          res.forEach(item => {
            imgList.push({
              id: item.id,
              preview: item.preview_url,      // 必要，图片地址，key值可自定义，默认为src
              width: parseInt(item.width),    // 暂时必要，图片真实宽度
              height: parseInt(item.height)   // 暂时必要，图片真实高度
            });
          });
          this.imgsArr = imgList;
        }).catch(err => {
          console.log(err);
        });
      }
    },
}
</script>
<style lang="scss" scoped>
.home {
  width: 100vw;             // 容器的宽
  height: 100vh;            // 容器的高
  .ctrl-box {
    width: 100%;
    height: 100%;
    position: relative;
  }
}
</style>
```
## Props

| props               | type   | default | 说明                                  |
| :------------------ | :----- | :------ | :----------------------------------- |
| gap                 | Number | 20      | 图片间距                              |
| height              | Number | -       | 容器高度（px）不传时父元素必须具有height |
| imgsArr             | Array  | 必传    | 瀑布流数据                             |
| imgWidth            | Number | 300     | 每列的基础宽度                         |
| maxCols             | Number | 0       | 最多列数，0为不限                      |
| reachBottomDistance | Number | 20      | 滚动触底距离，触发加载新图片             |
| sectionSize         | Number | 600     |                                      |
| srcKey              | String | 'src'   | 自定义图片地址的key值                  |
| width               | Number | -       | 容器宽度（px）                         |









