<<<<<<< HEAD
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

### 全局引入无效，待研究

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
      :moreHeight="moreHeight"      // 额外高度
      :showLoading="loading",    // loading
      srcKey="preview"      // 自定义图片地址的key值
      @scrollReachBottom="getData"  // 滚动到底部获取更多数据
    )
      template(v-slot="{data}")
        .img-box            // 自定义内容
          .img-wraper(:style="setImgWraperStyle(data)")
            img(:src="data.preview")
          .ctrl-box(:style="{height: moreHeight + 'px'}")
            .xxx {{data.id}}
</template>
<script>
import VueWaterfallEx from "vue-waterfall-ex"
export default{
    data() {
      return {
        imgsArr: [],
        loading: false,
        moreHeight: 60
      };
    },
    created() {
      this.getData();
    },
    methods: {
      getData() {
        this.loading = true;
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
          this.loading = false;
        }).catch(err => {
          this.loading = false;
          console.log(err);
        });
      },
      setImgWraperStyle(data) {
        return {
          height: data._height - this.moreHeight + "px"
        };
      }
    },
    components: {
      VueWaterfallEx
    }
}
</script>
<style lang="scss" scoped>
.home {
  width: 100vw;             // 容器的宽
  height: 100vh;            // 容器的高
  .img-box {
    overflow: hidden;
    width: 100%;
    height: 100%;
    .img-wraper {
      width: 100%;
      height: auto;
      img {
        width: 100%;
        height: auto;
        border-radius: 16px;
        display: block;
      }
    }
    .ctrl-box {
      width: 100%;
      position: relative;
      padding: 10px;
    }
  }
}
</style>
```
## Props

| props               | type    | default | 说明                                  |
| :------------------ | :------ | :------ | :----------------------------------- |
| gap                 | Number  | 20      | 图片间距                              |
| height              | Number  | -       | 容器高度（px）不传时父元素必须具有height |
| imgsArr             | Array   | 必传    | 瀑布流数据                             |
| imgWidth            | Number  | 300     | 每列的基础宽度（px）                   |
| maxCols             | Number  | 0       | 最多列数，0为不限                      |
| moreHeight          | Number  | 0       | 额外的高度（px）                       |
| reachBottomDistance | Number  | 20      | 滚动触底距离（px），触发加载新图片       |
| sectionSize         | Number  | 600     |                                      |
| showLoading         | Boolean | false   | 是否显示loading                       |
| srcKey              | String  | src     | 自定义图片地址的key值                  |
| width               | Number  | -       | 容器宽度（px）                         |









=======
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

### 全局引入无效，待研究

```
// main.js

import VueWaterfallEx from 'vue-waterfall-ex';
Vue.use(VueWaterfallEx)
```


### 在组件中使用

```pug
<template lang="pug">
  .home
    vue-waterfall-ex(
      ref="VueWaterfallEx"
      v-if="allImgsArr.length > 0",
      :imgsArr="imgsArr"                      // 瀑布流数据 —— 必填
      :maxCols="3"                            // 最多列数
      :imgWidth="300"                         // 每列的基础宽度
      :moreHeight="moreHeight"                // 额外高度
      srcKey="preview"                        // 自定义图片地址的key值
      @scroll-reach-bottom="getData"          // 滚动到底部获取更多数据
      @set-loading-stats="setLoadingStats"    // 设置loading的状态
    )
      template(v-slot="{data}")
        .img-box            // 自定义内容
          .img-wraper(:style="setImgWraperStyle(data)")
            img(:src="data.preview")
          .ctrl-box(:style="{height: moreHeight + 'px'}")
            .xxx {{data.id}}
    .flash(v-if="isFirstLoad") Flash
    .loaderr(v-else-if="loadErr") Error...
    .nodata(v-else-if="allImgsArr.length === 0") NoData
    .loading(v-if="isLoading") Loading
</template>
```

```javascript
<script>
// vue2
import VueWaterfallEx from "vue-waterfall-ex"
let page = 0;
export default{
    name: "App",
    data() {
      return {
        imgsArr: [],
        allImgsArr: [],
        loading: false,
        moreHeight: 60,
        isFirstLoad: true,
        isLoading: false,
        loadErr: false,
      };
    },
    created() {
      this.getData();
    },
    watch:{
      isLoading(newVal){
        if (!newVal && this.isFirstLoad) this.isFirstLoad = false;
      }
    },
    methods: {
      formatData(data){
        return data.map(({id, preview_url, width, height})=>({
          id,
          preview: preview_url,    // 必要，图片地址，key值可自定义，默认为src
          width: Number(width),    // 建议添加，图片真实宽度
          height: Number(height)   // 建议添加，图片真实高度
        }))
      },
      filterData(data){
        return data.filter(item => !allImgsArr.value.includes(item.id));
      },
      getData() {
        if(this.loading) return;
        this.loading = true;
        const _page = page + 1;
        const params = {
          limit: 20,
          page: _page,
        }
        this.$axios.get("图片地址接口", { params }).then(res => {
          if(res.status === 200){
            this.imgsArr = formatData(filterData(res.data));
            this.allImgsArr = this.allImgsArr.concat(
              this.imgsArr.map(x => x.id)
            );
            if( !this.imgsArr[0] || (this.imgsArr[0].width && this.imgsArr[0].height) ){
              this.isLoading = false;
              this.isFirstLoad = false;
            }
            page = _page;
          } else {
            this.isLoading = false;
          }
        }).catch(err => {
          this.isLoading = false;
          this.loadErr = true;
          console.log(err);
        });
      },
      setImgWraperStyle(data) {
        return {
          height: data._height - this.moreHeight + "px"
        };
      },
      setLoadingStats(stats){
        this.isLoading = stats;
      }
    },
    components: {
      VueWaterfallEx
    }
}
</script>
```

``` javascript
<script lang="ts">
// vue3
import { defineComponent, ref, Ref, watch } from "vue";
import VueWaterfallEx from "vue-waterfall-ex";
import axios from "axios";

interface Ijson {
  [key: string]: string | number | boolean;
}

interface Iparams {
  limit: number;
  page: number;
  tags?: string;
}

type strNum = string | number;

export default defineComponent({
  name: "App",
  components: {
    VueWaterfallEx,
    LoadingPage
  },
  setup() {
    const imgsArr = ref<Ijson[]>([]);
    let page = 0;

    const moreHeight = ref(60);

    const allImgsArr = ref<strNum[]>([]);

    const isFirstLoad = ref(true);
    const isLoading = ref(false);
    const loadErr = ref(false);

    const VueWaterfallEx: Ref<any> = ref(null);

    const setLoadingStats: (stats: boolean) => void = stats => {
      isLoading.value = stats;
    };

    const formatData: (data: Ijson[]) => Ijson[] = data => {
      return data.map(({ id, preview_url, width, height }) => ({
        id,
        preview: preview_url,
        width: Number(width),
        height: Number(height)
      }));
    };

    const filterData: (data: Ijson[]) => Ijson[] = data => {
      return data.filter(item => !allImgsArr.value.includes(item.id as number));
    };

    const getData: () => void = () => {
      if (isLoading.value) return;
      isLoading.value = true;
      const _page = page + 1;
      const params: Iparams = {
        limit: 20,
        page: _page,
      };
      axios
        .get("图片地址接口", { params })
        .then((res: any) => {
          if (res.status === 200) {
            imgsArr.value = formatData(filterData(res.data));
            allImgsArr.value = allImgsArr.value.concat(
              imgsArr.value.map(x => x.id) as strNum[]
            );

            if( !imgsArr.value[0] || (imgsArr.value[0].width && imgsArr.value[0].height) ){
              isLoading.value = false;
              isFirstLoad.value = false;
            }
            page = _page;
          } else {
            isLoading.value = false;
          }
        })
        .catch(err => {
          isLoading.value = false;
          loadErr.value = true;
          console.log("err => ", err);
        });
    };

    const setImgWraperStyle: (data: Ijson) => Ijson = (data) => {
      return {
        height: Number(data._height) - moreHeight.value + "px",
      };
    };
    const viewImg: (url: string) => void = url => {
      window.open(url, "_blank");
    };
    watch(isLoading, (newVal: boolean) => {
      if (!newVal && isFirstLoad.value) isFirstLoad.value = false;
    });
    getData();

    return {
      imgsArr,
      getData,
      isFirstLoad,
      setImgWraperStyle,
      viewImg,
      moreHeight,
      VueWaterfallEx,
      allImgsArr,
      isLoading,
      setLoadingStats,
      loadErr
    };
  },
});
</script>
```

```scss
<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
  padding: 10px;
  .img-box {
    overflow: hidden;
    width: 100%;
    height: 100%;
    .img-wraper {
      width: 100%;
      border-radius: 16px;
      background-color: #e7eaed;
      img {
        width: 100%;
        height: auto;
        border-radius: 16px;
        display: block;
      }
    }
    .ctrl-box {
      width: 100%;
      position: relative;
      padding: 10px;
      display: flex;
    }
  }
  .flash,
  .nodata,
  .loaderr {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 60px;
    color: #666;
    font-weight: bold;
  }
  .loading {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 60px;
  }
}
</style>
```
## Props

| props               | type    | default | 说明                                  |
| :------------------ | :------ | :------ | :----------------------------------- |
| gap                 | Number  | 20      | 图片间距                              |
| height              | Number  | -       | 容器高度（px）不传时父元素必须具有height |
| imgsArr             | Array   | 必传    | 瀑布流数据                             |
| imgWidth            | Number  | 300     | 每列的基础宽度（px）                   |
| maxCols             | Number  | 0       | 最多列数，0为不限                      |
| moreHeight          | Number  | 0       | 额外的高度（px）                       |
| reachBottomDistance | Number  | 20      | 滚动触底距离（px），触发加载新图片       |
| sectionSize         | Number  | 600     |                                      |
| srcKey              | String  | src     | 自定义图片地址的key值                  |
| width               | Number  | -       | 容器宽度（px）                         |









>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
