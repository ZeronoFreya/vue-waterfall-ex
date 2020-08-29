<template lang="pug">
.home
  vue-waterfall-ex(
    ref="VueWaterfallEx",
    v-if="allImgsArr.length > 0",
    :imgsArr="imgsArr",
    :maxCols="3",
    :imgWidth="300",
    :moreHeight="moreHeight",
    srcKey="preview",
    @scroll-reach-bottom="getData"
    @set-loading-stats="setLoadingStats"
  )
    template(v-slot="{data}")
      .img-box
        .img-wraper(:style="setImgWraperStyle(data)")
          img(:src="data.preview")
        .ctrl-box(:style="{ height: moreHeight + 'px' }")
          .xxx(@click="viewImg(data.imgUrl)") {{ data.id }}
  .flash(v-if="isFirstLoad") Flash
  .loaderr(v-else-if="loadErr") Error...
  .nodata(v-else-if="allImgsArr.length === 0") NoData
  .loading(v-if="isLoading")
    loading-page(:lineNum="5", lineColor="#ff6700")
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch } from "vue";
import VueWaterfallEx from "@/components/VueWaterfallEx/VueWaterfallEx.vue";
import axios from "axios";
import LoadingPage from "@/components/Loading.vue";

interface Ijson {
  [key: string]: string | number | boolean;
}

interface Iopt {
  limit: string;
  tags: string;
  url: string;
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

    const options: Iopt = {
      limit: process.env.VUE_APP_YANDE_LIMIT,
      tags: process.env.VUE_APP_YANDE_TAGS,
      url: process.env.VUE_APP_YANDE_URL,
    };

    // options.limit = "10";
    // options.tags = "misoni_comi";
    // options.url = "/yande/post";

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
      return data.map(({ id, preview_url, file_url, width, height }) => ({
        id,
        imgUrl: "https://yande.re/post/show/" + id,
        preview: preview_url,
        fileUrl: file_url,
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
        limit: Number(options.limit),
        page: _page,
      };
      if (options.tags) {
        params.tags = options.tags;
      }
      axios
        .get(options.url, { params })
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
  // ::v-deep .vue-waterfall-ex-loading {
  //   top: auto;
  //   left: auto;
  //   bottom: 0;
  //   right: 0;
  //   width: 100px;
  //   height: 60px;
  // }
}
</style> 