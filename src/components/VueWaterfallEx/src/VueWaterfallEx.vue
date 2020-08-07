<template lang="pug">
  .vue-waterfall-ex-container(
    ref="outerEl"
    :style="containerStyle"
  )
    .vue-waterfall-ex-scroll(ref="scrollEl")
      slot(name="waterfall-head")
      .vue-waterfall-ex(:style="waterfallExStyle")
        .img-box(
          v-for="(v,i) in displayItems"
          :key="v.id+'_'+i"
          :class="[{__err__: v._error}]"
          :style="getComputedStyle(v)"
          ref="imgBoxEls"
        )
          .img-wraper(v-if="v[srcKey]")
            img(:src="v[srcKey]")
          slot(:data="v")
        .over(v-if="over",ref="over")
          slot(name="waterfall-over") 被你看光了
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Ref, Emit } from "vue-property-decorator"

import Throttle from "lodash-decorators/throttle"
import Bind from "lodash-decorators/bind"
import SectionManager from "./SectionManager"
import SmoothScrolling from "./SmoothScrolling"

interface widthAndHeightObj {
    width: string
    height: string
}
interface displayItemObj {
    itemIndex: number
    key: number
    [key: string]: string | number
}
interface imgsObj {
    _x: number; 
    _y: number; 
    _width: number; 
    _height: number;
    [key: string]: string | number
}

let loadedCount: number
let sectionManager: SectionManager | null = null
let smoothScrolling: SmoothScrolling | null = null

@Component
export default class VueWaterfallEx extends Vue {
    // ================= Props start =================
    @Prop({
        type: Number,
        default: 20,
    })
    readonly gap!: number

    @Prop({
        type: Number,
        validator(v: number): boolean {
            return v >= 0
        },
    })
    readonly height?: number

    @Prop({
        type: Array,
        required: true,
    })
    readonly imgsArr!: imgsObj[]

    @Prop({
        type: Number,
        default: 300,
    })
    readonly imgWidth!: number

    @Prop({
        type: Number,
        default: 0,
    })
    readonly maxCols!: number

    @Prop({
        type: Number,
        default: 20,
    })
    readonly reachBottomDistance!: number

    @Prop({
        type: Number,
        default: 600,
    })
    readonly sectionSize!: number

    @Prop({
        type: String,
        default: "src",
    })
    readonly srcKey!: string

    @Prop({
        type: Number,
        validator(v: number): boolean {
            return v >= 0
        },
    })
    readonly width!: number

    // ================= Props end =================
    // ================= Data start =================
    // 开始要排列的图片索引,首次为第二列的第一张图片，后续加载则为已经排列图片的下一个索引
    private beginIndex: number = 0
    // 需要根据窗口宽度初始化
    private cols: number = 1
    private colsHeightArr: number[] = []
    private displayItems: displayItemObj[] = []
    private imgsArrCopy: imgsObj[] = []
    private imgWidthCopy: number = 0
    private isFirstLoad: boolean = true
    private isLoading: boolean = false
    private outerHeight: number = 0
    private outerWidth: number = 0
    // 结束waterfall加载
    private over: boolean = false
    private resizeObserver?: ResizeObserver
    private scrollPos: { x: number; y: number } = { x: 0, y: 0 }
    private totalHeight: number = 0
    private totalWidth: number = 0

    @Ref("outerEl") readonly outerEl!: HTMLDivElement
    @Ref("scrollEl") readonly scrollEl!: HTMLDivElement

    // ================= Data end =================
    // ================= Computed start =================
    private get containerStyle(): widthAndHeightObj {
        return {
            height: this.height ? this.height + "px" : "100%",
            width: this.width ? this.width + "px" : "100%",
        }
    }

    private get waterfallExStyle(): widthAndHeightObj {
        return {
            height: this.totalHeight + "px",
            width: this.totalWidth + "px",
        }
    }

    private get colWidth(): number {
        return this.imgWidthCopy + this.gap
    }
    // ================= Computed end =================

    @Watch("imgsArr")
    private wImgsArr(newW: imgsObj[]): void {
        this.isLoading = false
        if (newW.length > 0) this.preload()
        else this.over = true
    }

    private created(): void {
        this.$on("preloaded", () => {
            console.log("preloaded")
            this.isFirstLoad = true
            this.waterfallNew()
            this.onCollectionChanged()
            this.mathTotalHeight()
            smoothScrolling &&
                smoothScrolling.updateSize({
                    x: this.totalWidth - this.scrollEl.clientWidth,
                    y: this.totalHeight - this.scrollEl.clientHeight,
                })
        })
    }

    private mounted(): void {
        this.outerWidth = this.outerEl.clientWidth
        this.outerHeight = this.outerEl.clientHeight
        // console.log(this.outerEl, this.outerWidth, this.outerHeight);

        sectionManager = new SectionManager(this.sectionSize)
        this.calcColsAndImgW()
        this.preload()
        smoothScrolling = new SmoothScrolling(this.scrollEl)
        smoothScrolling.on("scroll", this.onScroll)

        if (ResizeObserver) {
            this.resizeObserver = new ResizeObserver(this.onContainerResized)
            this.resizeObserver.observe(this.outerEl)
        } else {
            this.outerEl.addEventListener("resize", this.onContainerResized)
        }
    }

    private beforeDestroy(): void {
        if (ResizeObserver) {
             this.resizeObserver && this.resizeObserver.disconnect()
        } else {
            this.outerEl.removeEventListener("resize", this.onContainerResized)
        }
    }
    // ================= Emit start =================
    @Emit("preloaded")
    private ePreloaded() {}

    @Emit("scrollReachBottom")
    private eScrollReachBottom() {}
    // ================= Emit end =================
    // ================= Method start =================
    private calcColsAndImgW(): void {
        if (!this.outerEl) return
        const colWidth: number = this.imgWidth + this.gap
        const w: number = this.outerEl.clientWidth + this.gap
        let cols: number = Math.floor(w / colWidth)
        // 当剩余空间大于imgWidth一半时，cols加1
        cols += w % colWidth > this.imgWidth / 2 ? 1 : 0
        cols = cols === 0 ? 1 : cols
        const imgWidthCopy: number = Math.floor(w / cols - this.gap)
        if (this.maxCols > 0 && cols > this.maxCols) {
            this.cols = this.maxCols
            this.imgWidthCopy =
                imgWidthCopy > this.imgWidth ? imgWidthCopy : this.imgWidth
        } else {
            this.imgWidthCopy = imgWidthCopy
            this.cols = cols
        }
    }

    private flushDisplayItems(rect: {
        x: number
        y: number
        width: number
        height: number
    }) {
        const { x, y, width, height } = rect
        const displayItems: displayItemObj[] = []
        const indices: number[] = sectionManager!.getCellIndices({
            _height: height,
            _width: width,
            _x: x,
            _y: y,
        })
        for (let i: number = 0; i < indices.length; i++) {
            const itemIndex: number = indices[i]
            displayItems.push(
                Object.freeze({
                    itemIndex,
                    key: displayItems.length,
                    ...this.imgsArrCopy[itemIndex],
                })
            )
        }
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(() => {
                this.displayItems = displayItems
                this.$forceUpdate()
            })
        } else {
            this.displayItems = displayItems
            this.$forceUpdate()
        }
    }

    private getComputedStyle(
        displayItem: displayItemObj
    ): {
        left: string
        top: string
        width: string
        height: string
    } {
        const { _width, _height, _x, _y } = displayItem
        return {
            left: `${_x}px`,
            top: `${_y}px`,
            width: `${_width}px`,
            height: `${_height}px`,
        }
    }

    private mathTotalHeight(): void {
        let h: number = 0
        if (this.colsHeightArr.length > 0) {
            h = Math.max(...this.colsHeightArr) - this.gap
        }
        this.totalHeight = h > 0 ? h : 0
        this.totalWidth = this.cols * this.colWidth - this.gap
    }

    private onCollectionChanged(): void {
        const collection = this.imgsArrCopy
        for (let i: number = this.beginIndex; i < collection.length; i++) {
            if (!collection[i]) return
            const { _x, _y, _width, _height } = collection[i]
            sectionManager!.registerCell({
                index: i,
                cellMetadatum: {
                    _x,
                    _y,
                    _width,
                    _height,
                },
            })
        }
        // 排列完之后，新增图片从这个索引开始预加载图片和排列
        this.beginIndex = this.imgsArrCopy.length
        this.flushDisplayItems({
            ...this.scrollPos,
            width: this.scrollEl.clientWidth,
            height: this.scrollEl.clientHeight,
        })
    }

    @Bind()
    @Throttle(250)
    private onContainerResized(): void {
        if (!this.outerEl) return
        if (this.outerEl.clientHeight !== this.outerHeight) {
            smoothScrolling &&
                smoothScrolling.updateSize({
                    x: this.totalWidth - this.scrollEl.clientWidth,
                    y: this.totalHeight - this.scrollEl.clientHeight,
                })
        }
        if (this.outerEl.clientWidth === this.outerWidth) return
        this.resetCollection()
    }

    @Bind()
    @Throttle(250)
    private onScroll(opt:MouseWheelEvent): void {
        this.scrollPos.x = opt.x
        this.scrollPos.y = opt.y < 0 ? Math.abs(opt.y) : 0
        const scrollEl = this.scrollEl
        this.flushDisplayItems({
            ...this.scrollPos,
            width: scrollEl.clientWidth,
            height: scrollEl.clientHeight,
        })
        if (this.isLoading || this.over) return
        const minHeight: number = Math.min(...this.colsHeightArr)
        if (
            this.scrollPos.y + scrollEl.offsetHeight >
            minHeight - this.reachBottomDistance
        ) {
            this.isLoading = true
            // 滚动触底
            this.eScrollReachBottom()
        }
    }

    private preload(): void {
        let imgItem: imgsObj
        loadedCount = 0
        if (this.imgsArr.length === 0) {
            // this.ePreloaded()
            return
        }
        for (let i: number = loadedCount; i < this.imgsArr.length; i++) {
            imgItem = this.imgsArr[i]
            if (imgItem.width && imgItem.height) {
                loadedCount++
                imgItem._width = this.imgWidthCopy
                imgItem._height = Math.round(
                    (this.imgWidthCopy * (imgItem.height as number)) /
                        (imgItem.width as number)
                )
                if (loadedCount === this.imgsArr.length) {
                    this.ePreloaded()
                    return
                }
            } else {
                console.log("没有宽高")
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
    }

    private resetCollection(): void {
        this.totalHeight = 0
        this.beginIndex = 0
        this.colsHeightArr = []
        sectionManager = null
        sectionManager = new SectionManager(this.sectionSize)
        this.calcColsAndImgW()
        this.waterfallAll()
        this.onCollectionChanged()
        this.mathTotalHeight()
        smoothScrolling &&
            smoothScrolling.updateSize({
                x: this.totalWidth - this.scrollEl.clientWidth,
                y: this.totalHeight - this.scrollEl.clientHeight,
            })
    }

    private waterfallAll(): void {
        let top: number, left: number, height: number
        const colWidth = this.colWidth
        this.colsHeightArr = []
        const newArr: imgsObj[] = []
        for (let i: number = 0; i < this.imgsArrCopy.length; i++) {
            this.imgsArrCopy[i]._width = this.imgWidthCopy
            this.imgsArrCopy[i]._height = Math.round(
                (this.imgWidthCopy * (this.imgsArrCopy[i].height as number)) /
                    (this.imgsArrCopy[i].width as number)
            )
            height = (this.imgsArrCopy[i]._height as number) + this.gap
            if (newArr.length < this.cols) {
                this.colsHeightArr.push(height)
                top = 0
                left = i * colWidth
            } else {
                const minHeight: number = Math.min(...this.colsHeightArr)
                const minIndex: number = this.colsHeightArr.indexOf(minHeight)
                // 设置元素定位的位置
                top = minHeight
                left = minIndex * colWidth
                // 更新colsHeightArr
                this.colsHeightArr[minIndex] = minHeight + height
            }
            this.imgsArrCopy[i]._y = top
            this.imgsArrCopy[i]._x = left
            newArr.push({
                ...this.imgsArrCopy[i],
            })
        }
        this.imgsArrCopy = newArr
    }

    private waterfallNew(): void {
        if (this.imgsArr.length === 0) return
        let top: number, left: number, height: number
        const colWidth = this.colWidth
        for (let i = 0; i < this.imgsArr.length; i++) {
            if (!this.imgsArr[i]) return
            height = (this.imgsArr[i]._height as number) + this.gap
            if (this.imgsArrCopy.length < this.cols) {
                this.colsHeightArr.push(height)
                top = 0
                left = i * colWidth
            } else {
                const minHeight: number = Math.min(...this.colsHeightArr)
                const minIndex: number = this.colsHeightArr.indexOf(minHeight)
                // 设置元素定位的位置
                top = minHeight
                left = minIndex * colWidth
                // 更新colsHeightArr
                this.colsHeightArr[minIndex] = minHeight + height
            }
            this.imgsArr[i]._y = top
            this.imgsArr[i]._x = left
            this.imgsArrCopy.push({
                ...this.imgsArr[i],
            })
        }
    }
    // ================= Method end =================
}
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

        & > .img-box {
            position: absolute;
        }

        .img-wraper {
            position: absolute;
            z-index: 0;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            img {
                width: 100%;
                height: auto;
            }
        }

        .__err__ .img-wraper {
            background-image: url(data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QMraHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk1M0JCM0QwNkVFNDExRThCNTJCQUQ2RDFGQzg0NzIxIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk1M0JCM0NGNkVFNDExRThCNTJCQUQ2RDFGQzg0NzIxIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QTYwRUMyMDE2RUUzMTFFOEJCRTU5RTFDODg1ODgwMjYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QTYwRUMyMDI2RUUzMTFFOEJCRTU5RTFDODg1ODgwMjYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAQCwsLDAsQDAwQFw8NDxcbFBAQFBsfFxcXFxcfHhcaGhoaFx4eIyUnJSMeLy8zMy8vQEBAQEBAQEBAQEBAQEBAAREPDxETERUSEhUUERQRFBoUFhYUGiYaGhwaGiYwIx4eHh4jMCsuJycnLis1NTAwNTVAQD9AQEBAQEBAQEBAQED/wAARCACRAJEDASIAAhEBAxEB/8QAZQAAAwEBAQAAAAAAAAAAAAAAAAIDAQQHAQEAAAAAAAAAAAAAAAAAAAAAEAACAQMDBAEFAAMBAAAAAAAAAQIRMQMhQRJRYYEycZHBIkITsdFSYhEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A9AAAAAMFnNQWt9kAwkssVbV9CTnKb10XQVtLSyAd5ZuzURW27yfhmX9RlDI+wD4Vf/ZVi41SKCdeNI3YEnOXJtOiBZZr/wBGcMi2Ft7AXjli76PoOcqael0Mpyg9NV0A6QEhNTWl90MBoAAAAAAGGiTlxjXfZAZkycdEqyI3q26sOrd92CTm6bbsA1boh1i3lqPGKiqIZAYklYHY0x6tIDY2B3NdjEBgNJ3NACTxbx0E1TozoYsoqSowI2o06MtjyctGqSItODptsw6NX2YHSaJCXKNd90OAAAAYznnLnJvZWK5pUjRXloiNdwCjk0l9S0YqKohcSpGrvLUcDUBLK23x23FWNtVSAuHch/KXQP5PoBdqq77GJ1XfczFVKjVBcuPk6rXqBQCH8n0D+UugFwZD+bV1oNif5OOzQDyipKjI0cW0/qXYmVVjVXjqAkZcHXZ3OhHNXcthlWNHeOjAoAABDLKs6bISlWl1Busm+42Jfm30At2BmI1gRy+3gpD1XwTy+3gpH1QDASyt8uKdFuJRw1iwOjdBKy+TIutGbK3kAAxtJNuwiywdmA7s/glj9/BV04unQli9l8AWDsBjAhSja6D4pUnTZmZV+afUVOkk+4HUBgAc0bD4v2+fsJGw+L9vn7AVQMEDAjl9vBSHqvgnl9vBSHqvgDJwbfJC8JPSlEO5wTo3qMnUDEqNGz0jXoD08BRSXyBB/m6u2xvFPQ1qjoDAVNxqv1ZuJUnT5BGw9/AFQYAwJZf1+fsJKw+X9fn7CSsB0AAAc7VG13GxP82uoZFSbezFWkkwOgGCBgRy15adDZTaioq7QZPfwZQDFFfPc2MnB0vE1AwCc+WituPjaS4kzU6agPkS9hEVeqJJU0AAh7+ACHv4AqAAwI5X+aXQVKrS7g3WTY2ONZp7IC9AAAJ5lWNf+dSV1XqdL1VGc8lxk47bAUxyqqO60GIpuL5LyuxZNNVVtmAmVfkpbbi1RYAI1QVRYAI1QJ1aRYzdAbJ8Y1I1RZggI1SNxL8uW1NCoAYxckqKiu9Bm0lV23ZFtyfJ+F2Ayyr0K4VSNf8ArUnFcpKO250LRUQABoAYLkhzXdWHMA5u26uNGXF9tx8uOusfYlbTcC6aaqrdTTnTlHVfQrHJF6PRsBwAAC5i9vg0xbgaAIAAxtJVduosskVotWiTcpav6ANKXJ9the27sF9NyuLHTWXsA2OHBd3cYDQAAAAAAAwSeNS1syhgHNRxdJfUK10ujoaTuJLCrp0Amm1Ztdhv6z3Sfkxwmu4leqoBT+1P1f8AkZy4469daEaopllRqPRAH9ZOyp5Fbbu2+xmuyGUJvsAtaaWQUcnSP1Kxwq7dR0krALDGo63Y4GgAAAAAAAAAAAAAAAAAshJ7AAGK6B3YABsNx4gADAAAAAAAAAAAAAf/2Q==);
            background-repeat: no-repeat;
            background-position: center;
            background-size: 50% 50%;

            img {
                display: none;
            }
        }
    }

    .over {
        position: absolute;
        bottom: 0;
        left: 0;
        transform: translateY(100%);
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        color: #aaa;
    }
}
</style>
