<template lang="pug">
  .home(ref="vcContainer")
    vue-waterfall-ex(
      :imgsArr="imgsArr"
      :maxCols="3"
      :imgWidth="300"
      srcKey="preview"
      @scrollReachBottom="getData"
    )
      template(v-slot="{data}")
        .ctrl-box
          .xxx {{data.id}}
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
// import VueWaterfallEx from "@/VueWaterfallEx.vue";

interface ImgsObj {
  [key: string]: string | number;
}

@Component({
  components: {
    // VueWaterfallEx
  }
})
export default class App extends Vue {
  private imgsArr: ImgsObj[] = [];

  created() {
    this.getData();
  }

  getData() {
    axios
      .get("https://yande.re/post.json", {
        params: {
          limit: 3,
          page: 1,
          tags: "misoni_comi"
        }
      })
      .then((res: any) => {
        res = res.data as { [key: string]: string | number }[];
        const imgList: ImgsObj[] = [];
        res.forEach((item: { [key: string]: string | number }) => {
          imgList.push({
            id: item.id,
            imgUrl: "https://yande.re/post/show/" + item.id,
            preview: item.preview_url,
            fileUrl: item.file_url,
            width: Math.floor(item.width as number),
            height: Math.floor(item.height as number)
          });
        });
        this.imgsArr = imgList;
      })
      .catch(err => {
        console.log(err);
      });
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
  .ctrl-box {
    width: 100%;
    height: 100%;
    position: relative;
  }
}
</style>
