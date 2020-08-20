<template lang="pug">
.home
  vue-waterfall-ex(
    :imgsArr="imgsArr",
    :maxCols="3",
    :imgWidth="300",
    :moreHeight="moreHeight",
    :showLoading="loading",
    srcKey="preview",
    @scroll-reach-bottom="getData"
  )
    template(v-slot="{data}")
      .img-box
        .img-wraper(:style="setImgWraperStyle(data)")
          img(:src="data.preview")
        .ctrl-box(:style="{height: moreHeight + 'px'}")
          .xxx(@click="viewImg(data.imgUrl)") {{ data.id }}
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import VueWaterfallEx from "@/components/VueWaterfallEx/VueWaterfallEx.vue";
import axios from "axios";

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

export default defineComponent({
  name: "App",
  components: {
    VueWaterfallEx
  },
  setup() {
    const imgsArr = ref<Ijson[]>([]);
    let page = 0;

    const options: Iopt = {
      limit: process.env.VUE_APP_YANDE_LIMIT,
      tags: process.env.VUE_APP_YANDE_TAGS,
      url: process.env.VUE_APP_YANDE_URL
    };

    // options.limit = '10'
    // options.tags = 'misoni_comi'
    // options.url = '/yande/post'

    const moreHeight = ref(60);

    const loading = ref(false);

    const formatData: (data: Ijson[]) => Ijson[] = data => {
      const imgList: Ijson[] = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        imgList.push({
          id: item.id,
          imgUrl: "https://yande.re/post/show/" + item.id,
          preview: item.preview_url,
          fileUrl: item.file_url,
          width: Number(item.width),
          height: Number(item.height)
        });
      }
      return imgList;
    };

    const getData: () => void = () => {
      loading.value = true;
      const _page = page + 1;
      const params: Iparams = {
        limit: Number(options.limit),
        page: _page
      };
      if (options.tags) {
        params.tags = options.tags;
      }
      axios
        .get(options.url, { params })
        .then((res: any) => {
          imgsArr.value = formatData(res.data);
          loading.value = false;
          page = _page;
        })
        .catch(err => {
          console.log(err);
          loading.value = false;
        });
    };

    const setImgWraperStyle: (data: Ijson) => Ijson = data => {
      return {
        height: Number(data._height) - 60 + "px"
      };
    };
    const viewImg: (url: string) => void = (url) => {
      window.open(url, "_blank")
    }
    getData();

    return {
      imgsArr,
      getData,
      loading,
      setImgWraperStyle,
      viewImg,
      moreHeight
    };
  }
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
      height: 60px;
      position: relative;
      padding: 10px;
      display: flex;
    }
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
