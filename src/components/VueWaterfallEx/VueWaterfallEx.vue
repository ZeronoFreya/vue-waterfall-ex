<template lang="pug">
.vue-waterfall-ex-container(ref="outerEl", :style="containerStyle")
<<<<<<< HEAD
  .vue-waterfall-ex-scroll(ref="scrollEl", v-if="imgsCount > 0")
=======
  .vue-waterfall-ex-scroll(ref="scrollEl")
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
  .vue-waterfall-ex-loading(v-if="isLoading")
    slot(name="waterfall-loading")
      loading-line(:lineNum="5", lineColor="#ff6700")
  .vue-waterfall-ex-nodata(ref="nodataEl", v-else-if="imgsCount === 0")
    slot(name="waterfall-nodata")
      .vue-waterfall-ex-nodata-default NoData
=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
  nextTick,
=======
  // nextTick
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
  // reactive,
} from "vue";

import SectionManager from "./SectionManager";
import SmoothScrolling from "./SmoothScrolling";
import throttle from "lodash.throttle";
<<<<<<< HEAD
import LoadingLine from "./Loading.vue";
=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12

interface Ijson {
  [key: string]: string | number | boolean;
}

interface IdisplayItem extends Ijson {
  itemIndex: number;
  key: number;
}

<<<<<<< HEAD
// interface ImgsObj {
//   _x: number;
//   _y: number;
//   _width: number;
//   _height: number;
//   [key: string]: string | number;
// }

=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
    gap: {
      type: Number,
      default: 20,
    },
=======
    /**图片的间距
     * （水平|垂直）
     */
    gap: {
      type: Number,
      default: 20
    },
    /**容器的高度*/
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
    height: {
      type: Number,
      validator(v: number): boolean {
        return v >= 0;
<<<<<<< HEAD
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
=======
      }
    },
    /**图片数据
     * （Json数组，要求至少包含图片路径，key值[srcKey]可自定义，默认src）
     */
    imgsArr: {
      type: Array,
      required: true
    },
    /**图片基础宽度，据此算出图片自适应宽度
     * （ 0.5 \* imgWidth < imgWidth < 1.5 \* imgWidth ）
     */
    imgWidth: {
      type: Number,
      default: 300
    },
    /**最大列数，0为不限制*/
    maxCols: {
      type: Number,
      default: 0
    },
    /**追加高度，可以使图片的父元素更高一些，方便添加额外元素，如工具栏*/
    moreHeight: {
      type: Number,
      default: 0
    },
    /**是否预加载图片，会增加服务器压力，但用户体验更好*/
    preloadImg: {
      type: Boolean,
      default: true
    },
    /**距离底部的距离为多少时便认为触底*/
    reachBottomDistance: {
      type: Number,
      default: 20
    },
    /**块的大小（方形）*/
    sectionSize: {
      type: Number,
      default: 600
    },
    /**图片数据中图片路径的key值*/
    srcKey: {
      type: String,
      default: "src"
    },
    /**容器的宽度*/
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
    width: {
      type: Number,
      validator(v: number): boolean {
        return v >= 0;
<<<<<<< HEAD
      },
    },
  },
  components: {
    LoadingLine,
  },
  emits: ["scroll-reach-bottom"],
=======
      }
    }
  },
  // components: {
  // },
  emits: ["scroll-reach-bottom", "set-loading-stats", "img-error"],
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
  // eslint-disable-next-line
  setup(props: Readonly<any>, context: SetupContext) {
    let loadedCount: number;
    let sectionManager: SectionManager | null = null;
    let smoothScrolling: SmoothScrolling | null = null;

<<<<<<< HEAD
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
=======
    /**当前页图片数据的拷贝*/
    const imgsArr = ref<Ijson[]>(props.imgsArr);

    /**开始要排列的图片索引,首次为第二列的第一张图片，
     * 后续加载则为已经排列图片的下一个索引
     */
    let beginIndex = 0;
    /**瀑布流列数
     * 需要根据窗口宽度初始化
     */
    let cols = 1;
    /**瀑布流列高的集合*/
    let colsHeightArr: number[] = [];
    const displayItems = ref<IdisplayItem[]>([]);
    /**所有的图片数据*/
    let allImgsArr: Ijson[] = [];
    /**图片的显示宽度*/
    const imgWidth = ref(0);
    /**容器的高度*/
    let outerHeight = 0;
    /**容器的宽度*/
    let outerWidth = 0;
    /**是否触底*/
    let reachBottom = false;
    /**结束waterfall加载*/
    const over = ref(false);
    let resizeObserver: ResizeObserver | null = null;
    const totalHeight = ref(0);
    const totalWidth = ref(0);

    const scrollX = ref(0);
    const scrollY = ref(0);

    const outerEl: Ref<HTMLDivElement | null> = ref(null);
    const scrollEl: Ref<HTMLDivElement | null> = ref(null);
    const topTipEl: Ref<HTMLDivElement | null> = ref(null);
    const overTipEl: Ref<HTMLDivElement | null> = ref(null);
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12

    const containerStyle = computed(
      (): IstringWH => {
        return {
          height: props.height ? props.height + "px" : "100%",
<<<<<<< HEAD
          width: props.width ? props.width + "px" : "100%",
=======
          width: props.width ? props.width + "px" : "100%"
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
        };
      }
    );

    const waterfallExStyle = computed(
      (): IstringWH => {
        return {
          height: totalHeight.value + "px",
<<<<<<< HEAD
          width: totalWidth.value + "px",
=======
          width: totalWidth.value + "px"
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
        };
      }
    );

    const colWidth = computed((): number => {
<<<<<<< HEAD
      return imgWidthCopy.value + props.gap;
=======
      return imgWidth.value + props.gap;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
    });

    const topTipTranY = computed(() => {
      if (!topTipEl.value) return;
      const topTipH = topTipEl.value.clientHeight;
      let topTipTranY = topTipH * -1;
      if (scrollY.value > topTipH) {
        topTipTranY = scrollY.value * -1;
      }

      return {
<<<<<<< HEAD
        transform: `translateY(${topTipTranY}px)`,
=======
        transform: `translateY(${topTipTranY}px)`
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
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
=======
        transform: `translateY(${overTipTranY}px)`
      };
    });


    /**计算瀑布流的列数及每列的宽度*/
    const calcColsAndImgW: () => void = () => {
      if (!outerEl.value) return;
      const _colWidth: number = props.imgWidth + props.gap;
      const w: number = outerEl.value.clientWidth + props.gap;
      let _cols: number = Math.floor(w / _colWidth);
      // 当剩余空间大于imgWidth一半时，cols加1
      _cols += w % _colWidth > props.imgWidth / 2 ? 1 : 0;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      _cols = _cols === 0 ? 1 : _cols;
      const _imgWidth: number = Math.floor(w / _cols - props.gap);
      if (props.maxCols > 0 && _cols > props.maxCols) {
        cols = props.maxCols;
<<<<<<< HEAD
        imgWidthCopy.value =
          _imgWidth > props.imgWidth ? _imgWidth : props.imgWidth;
      } else {
        imgWidthCopy.value = _imgWidth;
=======
        imgWidth.value =
          _imgWidth > props.imgWidth ? _imgWidth : props.imgWidth;
      } else {
        imgWidth.value = _imgWidth;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
        cols = _cols;
      }
    };

    const waterfallNew: () => void = () => {
      if (imgsArr.value.length === 0) return;
      let top: number, left: number, height: number;
<<<<<<< HEAD
      // const colWidth = this.colWidth;
=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      for (let i = 0; i < imgsArr.value.length; i++) {
        // if (!imgsArr[i]) return;
        const _imgsArr = imgsArr.value[i];
        height = (_imgsArr._height as number) + props.gap;
<<<<<<< HEAD
        if (imgsArrCopy.length < cols) {
=======
        if (allImgsArr.length < cols) {
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
        imgsArrCopy.push({
          ..._imgsArr,
=======
        allImgsArr.push({
          ..._imgsArr
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
        });
      }
    };

    const waterfallAll: () => void = () => {
      let top: number, left: number, height: number;
<<<<<<< HEAD
      // const _colWidth = this.colWidth
      colsHeightArr = [];
      const newArr: Ijson[] = [];
      for (let i = 0; i < imgsArrCopy.length; i++) {
        const imgEl = imgsArrCopy[i];
        imgEl._width = imgWidthCopy.value;
        imgEl._height =
          Math.round(
            (imgWidthCopy.value * (imgEl.height as number)) /
=======
      colsHeightArr = [];
      const newArr: Ijson[] = [];
      for (let i = 0; i < allImgsArr.length; i++) {
        const imgEl = allImgsArr[i];
        imgEl._width = imgWidth.value;
        imgEl._height =
          Math.round(
            (imgWidth.value * (imgEl.height as number)) /
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
          ...imgEl,
        });
      }
      imgsArrCopy = newArr;
=======
          ...imgEl
        });
      }
      allImgsArr = newArr;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
    };
    /**
     * flushDisplayItems
     */
    const flushDisplayItems: (rect: {
      x: number;
      y: number;
      width: number;
      height: number;
<<<<<<< HEAD
    }) => void = (rect) => {
=======
    }) => void = rect => {
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      const { x, y, width, height } = rect;
      const _displayItems: IdisplayItem[] = [];
      const indices: number[] = sectionManager
        ? sectionManager.getCellIndices({
            _height: height,
            _width: width,
<<<<<<< HEAD
            _x: x,
            _y: y,
=======
            _x: Math.floor(x),
            _y: Math.floor(y)
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
          })
        : [];
      for (let i = 0; i < indices.length; i++) {
        const itemIndex: number = indices[i];
        _displayItems.push(
          Object.freeze({
            itemIndex,
            key: _displayItems.length,
<<<<<<< HEAD
            ...imgsArrCopy[itemIndex],
=======
            ...allImgsArr[itemIndex]
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
          })
        );
      }
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          displayItems.value = _displayItems;
<<<<<<< HEAD
          // this.$forceUpdate();
        });
      } else {
        displayItems.value = _displayItems;
        // this.$forceUpdate();
=======
        });
      } else {
        displayItems.value = _displayItems;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      }
    };
    /**
     * onCollectionChanged
     */
    const onCollectionChanged: () => void = () => {
      if (!scrollEl.value) return;
<<<<<<< HEAD
      for (let i = beginIndex; i < imgsArrCopy.length; i++) {
        const { _x, _y, _width, _height } = imgsArrCopy[i];
=======
      for (let i = beginIndex; i < allImgsArr.length; i++) {
        const { _x, _y, _width, _height } = allImgsArr[i];
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
        sectionManager &&
          sectionManager.registerCell({
            index: i,
            cellMetadatum: {
              _x: _x as number,
              _y: _y as number,
              _width: _width as number,
<<<<<<< HEAD
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
=======
              _height: _height as number
            }
          });
      }
      // 排列完之后，新增图片从这个索引开始预加载图片和排列
      beginIndex = allImgsArr.length;
      const x = scrollX.value < 0 ? Math.abs(scrollX.value) : 0;
      const y = scrollY.value < 0 ? Math.abs(scrollY.value) : 0;
      flushDisplayItems({
        x, y,
        width: scrollEl.value.clientWidth,
        height: scrollEl.value.clientHeight
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
      totalWidth.value = cols * colWidth.value - props.gap;
=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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

<<<<<<< HEAD
=======
      totalWidth.value = cols * colWidth.value - props.gap;

>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      const x = totalWidth.value - scrollEl.value.clientWidth;
      const y = totalHeight.value - scrollEl.value.clientHeight;
      smoothScrolling &&
        smoothScrolling.updateSize({
          x: x < 0 ? 0 : x,
<<<<<<< HEAD
          y: y < 0 ? 0 : y,
=======
          y: y < 0 ? 0 : y
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
        });
    };

    const getComputedStyle: (
      displayItem: IdisplayItem
    ) => {
      left: string;
      top: string;
      width: string;
      height: string;
<<<<<<< HEAD
    } = (displayItem) => {
=======
    } = displayItem => {
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      const { _width, _height, _x, _y } = displayItem;
      return {
        left: `${_x}px`,
        top: `${_y}px`,
        width: `${_width}px`,
<<<<<<< HEAD
        height: `${_height}px`,
      };
    };

    const onContainerResized = throttle(function () {
=======
        height: `${_height}px`
      };
    };
    /**窗口尺寸变化时的回调 */
    const onContainerResized = throttle(function() {
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
            y: y < 0 ? 0 : y,
=======
            y: y < 0 ? 0 : y
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
          });
      }
    }, 250);

<<<<<<< HEAD
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
=======
    const __onScroll = throttle(function() {
      if (!scrollEl.value) return;
      const x = scrollX.value < 0 ? Math.abs(scrollX.value) : 0;
      const y = scrollY.value < 0 ? Math.abs(scrollY.value) : 0;

      flushDisplayItems({
        x, y,
        width: scrollEl.value.clientWidth,
        height: scrollEl.value.clientHeight
      });
      if (reachBottom || over.value) return;

      const minHeight: number = Math.min(...colsHeightArr);
      if (
        y + scrollEl.value.offsetHeight >
        minHeight - props.reachBottomDistance
      ) {
        // 滚动触底
        console.log("触底");
        reachBottom = true;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
        context.emit("scroll-reach-bottom");
      }
    }, 250);

<<<<<<< HEAD
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
=======
    const onScroll: (opt: MouseWheelEvent) => void = opt => {
      if (totalHeight.value <= outerHeight) return;
      scrollX.value = opt.x;
      scrollY.value = opt.y;
      
      __onScroll();
    };

    /**预加载完成*/
    const preloaded: () => void = () => {
      if (!scrollEl.value) return;
      // console.log("preloaded");
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      waterfallNew();
      onCollectionChanged();
      mathTotalHeight();
      const x = totalWidth.value - scrollEl.value.clientWidth;
      const y = totalHeight.value - scrollEl.value.clientHeight;
      smoothScrolling &&
        smoothScrolling.updateSize({
          x: x < 0 ? 0 : x,
<<<<<<< HEAD
          y: y < 0 ? 0 : y,
        });
=======
          y: y < 0 ? 0 : y
        });
      reachBottom = false;
      context.emit("set-loading-stats", false);
    };

    const preloadImg: (imgItem: Ijson) => void = imgItem => {
      const img = new Image();
      img.src = imgItem[props.srcKey] as string;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
    };

    const preload: () => void = () => {
      // console.log('preload');
<<<<<<< HEAD

      // let imgItem: ImgsObj
      loadedCount = 0;
      if (imgsArr.value.length === 0) return;
=======
      loadedCount = 0;
      if (imgsArr.value.length === 0) return;
      // eslint-disable-next-line
      const timer: { [key: string]: any } = {};
      context.emit("set-loading-stats", true);
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      for (let i = 0; i < imgsArr.value.length; i++) {
        const imgItem = imgsArr.value[i];
        if (imgItem.width && imgItem.height) {
          loadedCount++;
<<<<<<< HEAD
          imgItem._width = imgWidthCopy.value;
          imgItem._height =
            Math.round(
              (imgWidthCopy.value * (imgItem.height as number)) /
                (imgItem.width as number)
            ) + props.moreHeight;
=======
          imgItem._width = imgWidth.value;
          imgItem._height =
            Math.round(
              (imgWidth.value * (imgItem.height as number)) /
                (imgItem.width as number)
            ) + props.moreHeight;
          props.preloadImg && preloadImg(imgItem);
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
          if (loadedCount === imgsArr.value.length) {
            // context.emit("preloaded")
            return preloaded();
          }
        } else {
<<<<<<< HEAD
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
=======
          imgItem._width = imgWidth.value;
          const img = new Image();
          img.src = imgItem[props.srcKey] as string;
          if (img.complete) {
            loadedCount++;
            imgItem.width = img.width;
            imgItem.height = img.height;
            imgItem._height =
              Math.round((imgWidth.value * img.height) / img.width) +
              props.moreHeight;
            if (loadedCount === imgsArr.value.length) {
              // context.emit("preloaded")
              return preloaded();
            }
          } else {
            const timerName = "t" + i;
            timer[timerName] = setInterval(() => {
              if (img.width > 0 && img.height > 0) {
                loadedCount++;
                imgItem.width = img.width;
                imgItem.height = img.height;
                imgItem._height =
                  Math.round((imgWidth.value * img.height) / img.width) +
                  props.moreHeight;
                
                clearInterval(timer[timerName]);
                timer[timerName] = null;
                if (loadedCount === imgsArr.value.length) {
                  // context.emit("preloaded")
                  return preloaded();
                }
              }
            }, 40);
            img.onerror = () => {
              if(timer[timerName]){
                clearInterval(timer[timerName]);
                loadedCount++;
                imgItem.width = 100;
                imgItem.height = 100;
                imgItem._height = imgWidth.value;
                imgItem._error = true;
                context.emit("img-error", imgItem);
                if (loadedCount === imgsArr.value.length) {
                  // context.emit("preloaded")
                  return preloaded();
                }
              }
              
            };
          }
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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

<<<<<<< HEAD
=======
      totalWidth.value = cols * colWidth.value - props.gap;

>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      if (ResizeObserver) {
        resizeObserver = new ResizeObserver(onContainerResized);
        resizeObserver.observe(outerEl.value);
      } else {
        outerEl.value.addEventListener("resize", onContainerResized);
      }
    };

<<<<<<< HEAD
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
=======
    watch(
      () => props.imgsArr,
      (newVal: Ijson[]) => {
        // console.log("watch: imgsArr", newVal.length);
        imgsArr.value = newVal;
        if(newVal.length > 0) preload();
        else over.value = true;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      },
      { deep: false, immediate: false }
    );

<<<<<<< HEAD
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
=======
    onMounted(() => {
      init();
      preload();
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
    });

    onBeforeUnmount(() => {
      if (ResizeObserver) {
        resizeObserver && resizeObserver.disconnect();
      } else if (outerEl.value) {
        outerEl.value.removeEventListener("resize", onContainerResized);
      }
    });

    return {
<<<<<<< HEAD
      imgsCount,
=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
      containerStyle,
      waterfallExStyle,
      displayItems,
      getComputedStyle,
      topTipTranY,
      overTipTranY,
      over,
      outerEl,
      scrollEl,
<<<<<<< HEAD
      nodataEl,
      topTipEl,
      overTipEl,
      isLoading,
    };
  },
=======
      topTipEl,
      overTipEl,
    };
  }
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
});
</script>

<style lang="scss" scoped>
.vue-waterfall-ex-container {
<<<<<<< HEAD
  // width: 100%;
  // height: 100%;
  position: relative;

=======
  position: relative;
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
  .vue-waterfall-ex-scroll {
    position: relative;
    width: 100%;
    height: 100%;
<<<<<<< HEAD
    // overflow-x: hidden;
    // overflow-y: scroll;
=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
    // transform: translateY(-100%);
=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
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
<<<<<<< HEAD
    // transform: translateY(100%);
=======
>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #aaa;
<<<<<<< HEAD
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
=======
  }

>>>>>>> 04b2b59cfe43670b2e4a8564b27336ac68110d12
}
</style>
