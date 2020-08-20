<template lang="pug">
.vue-waterfall-ex-container(ref="outerEl", :style="containerStyle")
  .vue-waterfall-ex-scroll(ref="scrollEl", v-if="imgsCount > 0")
    .vue-waterfall-ex(:style="waterfallExStyle")
      .vue-waterfall-ex-top(ref="topTipEl", :style="topTipTranY")
        slot(name="waterfall-head") 前面没有了
      .vue-waterfall-ex-img-box(
        v-for="(v, i) in displayItems",
        :key="v.id + '_' + i",
        :class="[{ __err__: v._error }]",
        :style="getComputedStyle(v)"
      )
        slot(:data="v")
          .vue-waterfall-ex-img-wraper(v-if="v[srcKey]")
            img(:src="v[srcKey]")
      .vue-waterfall-ex-over(
        v-if="over",
        ref="overTipEl",
        :style="overTipTranY"
      )
        slot(name="waterfall-over") 被你看光了
  .vue-waterfall-ex-loading(v-if="isLoading")
    slot(name="waterfall-loading")
      loading-line(:lineNum="5", lineColor="#ff6700")
  .vue-waterfall-ex-nodata(ref="nodataEl", v-else-if="imgsCount === 0")
    slot(name="waterfall-nodata")
      .vue-waterfall-ex-nodata-default NoData
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  Ref,
  SetupContext,
  watch,
  nextTick,
  // reactive,
} from "vue";

import SectionManager from "./SectionManager";
import SmoothScrolling from "./SmoothScrolling";
import throttle from "lodash.throttle";
import LoadingLine from "./Loading.vue";

interface Ijson {
  [key: string]: string | number | boolean;
}

interface IdisplayItem extends Ijson {
  itemIndex: number;
  key: number;
}

// interface ImgsObj {
//   _x: number;
//   _y: number;
//   _width: number;
//   _height: number;
//   [key: string]: string | number;
// }

interface IstringWH {
  width: string;
  height: string;
}

// interface Iprops {
//   gap: number;
//   height: number;
//   imgsArr: Ijson[];
//   imgWidth: number;
//   maxCols: number;
//   moreHeight: number;
//   reachBottomDistance: number;
//   sectionSize: number;
//   srcKey: string;
//   width: number;
// }

export default defineComponent({
  name: "VueWaterfallEx",
  props: {
    gap: {
      type: Number,
      default: 20,
    },
    height: {
      type: Number,
      validator(v: number): boolean {
        return v >= 0;
      },
    },
    imgsArr: {
      type: Array,
      required: true,
    },
    imgWidth: {
      type: Number,
      default: 300,
    },
    maxCols: {
      type: Number,
      default: 0,
    },
    moreHeight: {
      type: Number,
      default: 0,
    },
    reachBottomDistance: {
      type: Number,
      default: 20,
    },
    sectionSize: {
      type: Number,
      default: 600,
    },
    showLoading: {
      type: Boolean,
      default: false,
    },
    srcKey: {
      type: String,
      default: "src",
    },
    width: {
      type: Number,
      validator(v: number): boolean {
        return v >= 0;
      },
    },
  },
  components: {
    LoadingLine,
  },
  emits: ["scroll-reach-bottom"],
  // eslint-disable-next-line
  setup(props: Readonly<any>, context: SetupContext) {
    let loadedCount: number;
    let sectionManager: SectionManager | null = null;
    let smoothScrolling: SmoothScrolling | null = null;

    // let imgsArr: Ijson[] = props.imgsArr.concat();
    const imgsArr = ref<Ijson[]>(props.imgsArr);
    const imgsCount = ref(imgsArr.value.length);
    // 开始要排列的图片索引,首次为第二列的第一张图片，
    // 后续加载则为已经排列图片的下一个索引
    let beginIndex = 0;
    // 需要根据窗口宽度初始化
    let cols = 1;
    let colsHeightArr: number[] = [];
    const displayItems = ref<IdisplayItem[]>([]);
    let imgsArrCopy: Ijson[] = [];
    const imgWidthCopy = ref(0);
    let isFirstLoad = true;
    const isLoading = ref(true);
    let outerHeight = 0;
    let outerWidth = 0;
    // 结束waterfall加载
    const over = ref(false);
    let resizeObserver: ResizeObserver | null = null;
    const scrollPos = { x: 0, y: 0 };
    const totalHeight = ref(0);
    const totalWidth = ref(0);

    // const topTipH = ref(0);
    // const topTipTranY = ref(0);
    const scrollY = ref(0);

    // const pImgsArr = ref<Ijson[]>(props.imgsArr);

    const outerEl: Ref<HTMLDivElement | null> = ref(null);
    const scrollEl: Ref<HTMLDivElement | null> = ref(null);
    const nodataEl: Ref<HTMLDivElement | null> = ref(null);
    const topTipEl: Ref<HTMLDivElement | null> = ref(null);
    const overTipEl: Ref<HTMLDivElement | null> = ref(null);
    // let scrollOrNodataEl: HTMLDivElement | null = null;

    const containerStyle = computed(
      (): IstringWH => {
        return {
          height: props.height ? props.height + "px" : "100%",
          width: props.width ? props.width + "px" : "100%",
        };
      }
    );

    const waterfallExStyle = computed(
      (): IstringWH => {
        return {
          height: totalHeight.value + "px",
          width: totalWidth.value + "px",
        };
      }
    );

    const colWidth = computed((): number => {
      return imgWidthCopy.value + props.gap;
    });

    const topTipTranY = computed(() => {
      if (!topTipEl.value) return;
      const topTipH = topTipEl.value.clientHeight;
      let topTipTranY = topTipH * -1;
      if (scrollY.value > topTipH) {
        topTipTranY = scrollY.value * -1;
      }

      return {
        transform: `translateY(${topTipTranY}px)`,
      };
    });
    const overTipTranY = computed(() => {
      if (!over.value || !overTipEl.value || !scrollEl.value) return;
      const overTipH = overTipEl.value.clientHeight;
      let overTipTranY = overTipH;
      const bottom =
        scrollEl.value.clientHeight -
        totalHeight.value +
        Math.abs(scrollY.value);
      if (bottom > overTipH) {
        overTipTranY = bottom;
      }
      return {
        transform: `translateY(${overTipTranY}px)`,
      };
    });

    /**
     * 计算瀑布流的列数及每列的宽度
     */
    const calcColsAndImgW: () => void = () => {
      if (!outerEl.value) return;
      const colWidth: number = props.imgWidth + props.gap;
      const w: number = outerEl.value.clientWidth + props.gap;
      let _cols: number = Math.floor(w / colWidth);
      // 当剩余空间大于imgWidth一半时，cols加1
      _cols += w % colWidth > props.imgWidth / 2 ? 1 : 0;
      _cols = _cols === 0 ? 1 : _cols;
      const _imgWidth: number = Math.floor(w / _cols - props.gap);
      if (props.maxCols > 0 && _cols > props.maxCols) {
        cols = props.maxCols;
        imgWidthCopy.value =
          _imgWidth > props.imgWidth ? _imgWidth : props.imgWidth;
      } else {
        imgWidthCopy.value = _imgWidth;
        cols = _cols;
      }
    };

    const waterfallNew: () => void = () => {
      if (imgsArr.value.length === 0) return;
      let top: number, left: number, height: number;
      // const colWidth = this.colWidth;
      for (let i = 0; i < imgsArr.value.length; i++) {
        // if (!imgsArr[i]) return;
        const _imgsArr = imgsArr.value[i];
        height = (_imgsArr._height as number) + props.gap;
        if (imgsArrCopy.length < cols) {
          colsHeightArr.push(height);
          top = 0;
          left = i * colWidth.value;
        } else {
          const minHeight: number = Math.min(...colsHeightArr);
          const minIndex: number = colsHeightArr.indexOf(minHeight);
          // 设置元素定位的位置
          top = minHeight;
          left = minIndex * colWidth.value;
          // 更新colsHeightArr
          colsHeightArr[minIndex] = minHeight + height;
        }
        _imgsArr._y = top;
        _imgsArr._x = left;
        imgsArrCopy.push({
          ..._imgsArr,
        });
      }
    };

    const waterfallAll: () => void = () => {
      let top: number, left: number, height: number;
      // const _colWidth = this.colWidth
      colsHeightArr = [];
      const newArr: Ijson[] = [];
      for (let i = 0; i < imgsArrCopy.length; i++) {
        const imgEl = imgsArrCopy[i];
        imgEl._width = imgWidthCopy.value;
        imgEl._height =
          Math.round(
            (imgWidthCopy.value * (imgEl.height as number)) /
              (imgEl.width as number)
          ) + props.moreHeight;
        height = (imgEl._height as number) + props.gap;
        if (newArr.length < cols) {
          colsHeightArr.push(height);
          top = 0;
          left = i * colWidth.value;
        } else {
          const minHeight: number = Math.min(...colsHeightArr);
          const minIndex: number = colsHeightArr.indexOf(minHeight);
          // 设置元素定位的位置
          top = minHeight;
          left = minIndex * colWidth.value;
          // 更新colsHeightArr
          colsHeightArr[minIndex] = minHeight + height;
        }
        imgEl._y = top;
        imgEl._x = left;
        newArr.push({
          ...imgEl,
        });
      }
      imgsArrCopy = newArr;
    };
    /**
     * flushDisplayItems
     */
    const flushDisplayItems: (rect: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void = (rect) => {
      const { x, y, width, height } = rect;
      const _displayItems: IdisplayItem[] = [];
      const indices: number[] = sectionManager
        ? sectionManager.getCellIndices({
            _height: height,
            _width: width,
            _x: x,
            _y: y,
          })
        : [];
      for (let i = 0; i < indices.length; i++) {
        const itemIndex: number = indices[i];
        _displayItems.push(
          Object.freeze({
            itemIndex,
            key: _displayItems.length,
            ...imgsArrCopy[itemIndex],
          })
        );
      }
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          displayItems.value = _displayItems;
          // this.$forceUpdate();
        });
      } else {
        displayItems.value = _displayItems;
        // this.$forceUpdate();
      }
    };
    /**
     * onCollectionChanged
     */
    const onCollectionChanged: () => void = () => {
      if (!scrollEl.value) return;
      for (let i = beginIndex; i < imgsArrCopy.length; i++) {
        const { _x, _y, _width, _height } = imgsArrCopy[i];
        sectionManager &&
          sectionManager.registerCell({
            index: i,
            cellMetadatum: {
              _x: _x as number,
              _y: _y as number,
              _width: _width as number,
              _height: _height as number,
            },
          });
      }
      // 排列完之后，新增图片从这个索引开始预加载图片和排列
      beginIndex = imgsArrCopy.length;
      flushDisplayItems({
        ...scrollPos,
        width: scrollEl.value.clientWidth,
        height: scrollEl.value.clientHeight,
      });
    };

    /**
     * 计算瀑布流总高度
     */
    const mathTotalHeight: () => void = () => {
      let h = 0;
      if (colsHeightArr.length > 0) {
        h = Math.max(...colsHeightArr) - props.gap;
      }
      totalHeight.value = h > 0 ? h : 0;
      totalWidth.value = cols * colWidth.value - props.gap;
    };

    /**
     * 数据重置
     */
    const resetCollection: () => void = () => {
      if (!scrollEl.value) return;
      totalWidth.value = 0;
      totalHeight.value = 0;
      beginIndex = 0;
      colsHeightArr = [];
      sectionManager = null;
      sectionManager = new SectionManager(props.sectionSize);
      calcColsAndImgW();
      waterfallAll();
      onCollectionChanged();
      mathTotalHeight();

      const x = totalWidth.value - scrollEl.value.clientWidth;
      const y = totalHeight.value - scrollEl.value.clientHeight;
      smoothScrolling &&
        smoothScrolling.updateSize({
          x: x < 0 ? 0 : x,
          y: y < 0 ? 0 : y,
        });
    };

    const getComputedStyle: (
      displayItem: IdisplayItem
    ) => {
      left: string;
      top: string;
      width: string;
      height: string;
    } = (displayItem) => {
      const { _width, _height, _x, _y } = displayItem;
      return {
        left: `${_x}px`,
        top: `${_y}px`,
        width: `${_width}px`,
        height: `${_height}px`,
      };
    };

    const onContainerResized = throttle(function () {
      if (!outerEl.value || !scrollEl.value) return;
      // 竖版瀑布流
      if (outerEl.value.clientWidth !== outerWidth) {
        // 宽度发生变化，重新排版
        outerWidth = outerEl.value.clientWidth;
        resetCollection();
      } else if (outerEl.value.clientHeight !== outerHeight) {
        // 仅高度发生变化，只需更新smoothScrolling，不必要重新排版
        outerHeight = outerEl.value.clientHeight;
        const x = totalWidth.value - scrollEl.value.clientWidth;
        const y = totalHeight.value - scrollEl.value.clientHeight;
        smoothScrolling &&
          smoothScrolling.updateSize({
            x: x < 0 ? 0 : x,
            y: y < 0 ? 0 : y,
          });
      }
    }, 250);

    const __onScroll = throttle(function (opt: MouseWheelEvent) {
      if (!scrollEl.value) return;
      scrollPos.x = opt.x;
      scrollPos.y = opt.y < 0 ? Math.abs(opt.y) : 0;

      flushDisplayItems({
        ...scrollPos,
        width: scrollEl.value.clientWidth,
        height: scrollEl.value.clientHeight,
      });
      if (isLoading.value || over.value) return;
      // console.log('over', over);

      const minHeight: number = Math.min(...colsHeightArr);
      if (
        scrollPos.y + scrollEl.value.offsetHeight >
        minHeight - props.reachBottomDistance
      ) {
        // isLoading.value = true;
        // 滚动触底
        console.log("触底");
        context.emit("scroll-reach-bottom");
      }
    }, 250);

    const onScroll: (opt: MouseWheelEvent) => void = (opt) => {
      if (totalHeight.value <= outerHeight) return;
      scrollY.value = opt.y;
      __onScroll(opt);
    };

    /**
     * preloaded
     */
    const preloaded: () => void = () => {
      if (!scrollEl.value) return;
      // console.log("preloaded");
      // isFirstLoad = true;
      waterfallNew();
      onCollectionChanged();
      mathTotalHeight();
      const x = totalWidth.value - scrollEl.value.clientWidth;
      const y = totalHeight.value - scrollEl.value.clientHeight;
      smoothScrolling &&
        smoothScrolling.updateSize({
          x: x < 0 ? 0 : x,
          y: y < 0 ? 0 : y,
        });
    };

    const preload: () => void = () => {
      // console.log('preload');

      // let imgItem: ImgsObj
      loadedCount = 0;
      if (imgsArr.value.length === 0) return;
      for (let i = 0; i < imgsArr.value.length; i++) {
        const imgItem = imgsArr.value[i];
        if (imgItem.width && imgItem.height) {
          loadedCount++;
          imgItem._width = imgWidthCopy.value;
          imgItem._height =
            Math.round(
              (imgWidthCopy.value * (imgItem.height as number)) /
                (imgItem.width as number)
            ) + props.moreHeight;
          if (loadedCount === imgsArr.value.length) {
            // context.emit("preloaded")
            return preloaded();
          }
        } else {
          console.log("没有宽高");
          //       const oImg = new Image();
          //       oImg.src = imgItem.src;
          //       oImg.onload = oImg.onerror = e => {
          //         this.loadedCount++;
          //         // 预加载图片，计算图片容器的高
          //         imgItem._height =
          //           e.type == "load"
          //             ? Math.round(this.imgWidthCopy / (oImg.width / oImg.height))
          //             : this.imgWidthCopy;
          //         if (e.type == "error") {
          //           imgItem._error = true;
          //           this.$emit("imgError", imgItem);
          //         }
          //         if (this.loadedCount == this.imgsArr.length) {
          //           this.$emit("preloaded");
          //         }
          //       };
        }
      }
    };

    const init: () => void = () => {
      // console.log('init');

      if (!outerEl.value || !scrollEl.value) return;

      outerWidth = outerEl.value.clientWidth;
      outerHeight = outerEl.value.clientHeight;

      smoothScrolling = new SmoothScrolling(scrollEl.value);
      smoothScrolling.on("scroll", onScroll);

      sectionManager = new SectionManager(props.sectionSize);
      calcColsAndImgW();

      if (ResizeObserver) {
        resizeObserver = new ResizeObserver(onContainerResized);
        resizeObserver.observe(outerEl.value);
      } else {
        outerEl.value.addEventListener("resize", onContainerResized);
      }
    };

    const wImgsArr: (newVal: Ijson[]) => void = (newVal) => {
      imgsArr.value = newVal;
      // isLoading.value = false;
      if (newVal.length > 0) {
        imgsCount.value += newVal.length;
        if (isFirstLoad) {
          isFirstLoad = false;
          nextTick(() => {
            init();
            preload();
          });
        } else {
          preload();
        }
      } else over.value = true;
    };

    watch(
      () => props.imgsArr,
      (newVal: Ijson[]) => {
        // console.log("watch", newVal.length);
        wImgsArr(newVal);
      },
      { deep: false, immediate: false }
    );

    watch(
      () => props.showLoading,
      (newVal: boolean) => {
        isLoading.value = newVal;
      }
    );

    onMounted(() => {
      if (scrollEl.value) {
        isFirstLoad = false;
        // isLoading.value = false;
        init();
        preload();
      }
    });

    onBeforeUnmount(() => {
      if (ResizeObserver) {
        resizeObserver && resizeObserver.disconnect();
      } else if (outerEl.value) {
        outerEl.value.removeEventListener("resize", onContainerResized);
      }
    });

    return {
      imgsCount,
      containerStyle,
      waterfallExStyle,
      displayItems,
      getComputedStyle,
      topTipTranY,
      overTipTranY,
      over,
      outerEl,
      scrollEl,
      nodataEl,
      topTipEl,
      overTipEl,
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
.vue-waterfall-ex-container {
  // width: 100%;
  // height: 100%;
  position: relative;

  .vue-waterfall-ex-scroll {
    position: relative;
    width: 100%;
    height: 100%;
    // overflow-x: hidden;
    // overflow-y: scroll;
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .vue-waterfall-ex {
    margin: 0 auto;
    position: relative;

    & > .vue-waterfall-ex-img-box {
      position: absolute;
    }

    .vue-waterfall-ex-img-wraper {
      position: absolute;
      z-index: 0;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: auto;
        display: block;
      }
    }

    .__err__ .vue-waterfall-ex-img-wraper {
      background-image: url(data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QMraHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk1M0JCM0QwNkVFNDExRThCNTJCQUQ2RDFGQzg0NzIxIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk1M0JCM0NGNkVFNDExRThCNTJCQUQ2RDFGQzg0NzIxIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QTYwRUMyMDE2RUUzMTFFOEJCRTU5RTFDODg1ODgwMjYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QTYwRUMyMDI2RUUzMTFFOEJCRTU5RTFDODg1ODgwMjYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAQCwsLDAsQDAwQFw8NDxcbFBAQFBsfFxcXFxcfHhcaGhoaFx4eIyUnJSMeLy8zMy8vQEBAQEBAQEBAQEBAQEBAAREPDxETERUSEhUUERQRFBoUFhYUGiYaGhwaGiYwIx4eHh4jMCsuJycnLis1NTAwNTVAQD9AQEBAQEBAQEBAQED/wAARCACRAJEDASIAAhEBAxEB/8QAZQAAAwEBAQAAAAAAAAAAAAAAAAIDAQQHAQEAAAAAAAAAAAAAAAAAAAAAEAACAQMDBAEFAAMBAAAAAAAAAQIRMQMhQRJRYYEycZHBIkITsdFSYhEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A9AAAAAMFnNQWt9kAwkssVbV9CTnKb10XQVtLSyAd5ZuzURW27yfhmX9RlDI+wD4Vf/ZVi41SKCdeNI3YEnOXJtOiBZZr/wBGcMi2Ft7AXjli76PoOcqael0Mpyg9NV0A6QEhNTWl90MBoAAAAAAGGiTlxjXfZAZkycdEqyI3q26sOrd92CTm6bbsA1boh1i3lqPGKiqIZAYklYHY0x6tIDY2B3NdjEBgNJ3NACTxbx0E1TozoYsoqSowI2o06MtjyctGqSItODptsw6NX2YHSaJCXKNd90OAAAAYznnLnJvZWK5pUjRXloiNdwCjk0l9S0YqKohcSpGrvLUcDUBLK23x23FWNtVSAuHch/KXQP5PoBdqq77GJ1XfczFVKjVBcuPk6rXqBQCH8n0D+UugFwZD+bV1oNif5OOzQDyipKjI0cW0/qXYmVVjVXjqAkZcHXZ3OhHNXcthlWNHeOjAoAABDLKs6bISlWl1Busm+42Jfm30At2BmI1gRy+3gpD1XwTy+3gpH1QDASyt8uKdFuJRw1iwOjdBKy+TIutGbK3kAAxtJNuwiywdmA7s/glj9/BV04unQli9l8AWDsBjAhSja6D4pUnTZmZV+afUVOkk+4HUBgAc0bD4v2+fsJGw+L9vn7AVQMEDAjl9vBSHqvgnl9vBSHqvgDJwbfJC8JPSlEO5wTo3qMnUDEqNGz0jXoD08BRSXyBB/m6u2xvFPQ1qjoDAVNxqv1ZuJUnT5BGw9/AFQYAwJZf1+fsJKw+X9fn7CSsB0AAAc7VG13GxP82uoZFSbezFWkkwOgGCBgRy15adDZTaioq7QZPfwZQDFFfPc2MnB0vE1AwCc+WituPjaS4kzU6agPkS9hEVeqJJU0AAh7+ACHv4AqAAwI5X+aXQVKrS7g3WTY2ONZp7IC9AAAJ5lWNf+dSV1XqdL1VGc8lxk47bAUxyqqO60GIpuL5LyuxZNNVVtmAmVfkpbbi1RYAI1QVRYAI1QJ1aRYzdAbJ8Y1I1RZggI1SNxL8uW1NCoAYxckqKiu9Bm0lV23ZFtyfJ+F2Ayyr0K4VSNf8ArUnFcpKO250LRUQABoAYLkhzXdWHMA5u26uNGXF9tx8uOusfYlbTcC6aaqrdTTnTlHVfQrHJF6PRsBwAAC5i9vg0xbgaAIAAxtJVduosskVotWiTcpav6ANKXJ9the27sF9NyuLHTWXsA2OHBd3cYDQAAAAAAAwSeNS1syhgHNRxdJfUK10ujoaTuJLCrp0Amm1Ztdhv6z3Sfkxwmu4leqoBT+1P1f8AkZy4469daEaopllRqPRAH9ZOyp5Fbbu2+xmuyGUJvsAtaaWQUcnSP1Kxwq7dR0krALDGo63Y4GgAAAAAAAAAAAAAAAAAshJ7AAGK6B3YABsNx4gADAAAAAAAAAAAAAf/2Q==);
      background-repeat: no-repeat;
      background-position: center;
      background-size: 50% 50%;

      img {
        display: none;
      }
    }
  }
  .vue-waterfall-ex-top {
    position: absolute;
    top: 0;
    left: 0;
    // transform: translateY(-100%);
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #aaa;
  }
  .vue-waterfall-ex-over {
    position: absolute;
    bottom: 0;
    left: 0;
    // transform: translateY(100%);
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #aaa;
    // background-color: gold;
  }
  .vue-waterfall-ex-loading {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 60px;
  }
  .vue-waterfall-ex-nodata {
    width: 100%;
    height: 100%;
    .vue-waterfall-ex-nodata-default {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 60px;
      color: #666;
      font-weight: bold;
    }
  }
}
</style>
