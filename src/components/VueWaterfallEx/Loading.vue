<template lang="pug">
.loader
  svg(
    :x="svgRect.x + 'px'",
    :y="svgRect.y + 'px'",
    :width="svgRect.width + 'px'",
    :height="svgRect.height + 'px'",
    :viewBox="'0 0 ' + svgRect.width + ' ' + svgRect.height",
    xml:space="preserve"
  )
    rect(
      v-for="(item, index) in loadingLineArr",
      :key="index",
      :x="item.x",
      :y="item.y",
      :width="item.width",
      :height="item.height",
      :fill="lineColor"
    )
      animate(
        attributeName="height",
        attributeType="XML",
        :values="ahv",
        :begin="item.begin + 's'",
        :dur="item.dur + 's'",
        repeatCount="indefinite"
      )
      animate(
        attributeName="y",
        attributeType="XML",
        :values="ayv",
        :begin="item.begin + 's'",
        :dur="item.dur + 's'",
        repeatCount="indefinite"
      )
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";

interface Iloading {
  x: number;
  y: number;
  width: number;
  height: number;
  begin: number;
  dur: number;
}

export default defineComponent({
  name: "Loading",
  props:{
    lineColor:{
      type: String,
      default: '#333'
    },
    lineGap:{
      type: Number,
      default: 6
    },
    lineH:{
      type: Number,
      default: 5
    },
    lineMarginTop:{
      type: Number,
      default: 10
    },
    lineMaxH:{
      type: Number,
      default: 21
    },
    lineNum:{
      type: Number,
      default: 3
    },
    lineW:{
      type: Number,
      default: 4
    }
  },
  setup(props: Readonly<any>) {
    const loadingLineArr = ref<Iloading[]>([]);
    const loadingLineW = props.lineW as number;
    const loadingLineH = props.lineH as number;
    const loadingLineCount = props.lineNum as number;
    const loadingLineGap = props.lineGap as number;
    const loadingLineMarginTop = props.lineMarginTop as number;
    const svgH = loadingLineH + loadingLineMarginTop * 2;
    const loadingLineResize = (props.lineMaxH as number) > svgH 
      ? Math.floor((svgH - loadingLineH)/2) 
      : Math.floor(((props.lineMaxH as number) - loadingLineH)/2);
    const svgRect = reactive({
      x: 0,
      y: 0,
      width: 0,
      height: svgH
    })
    const ahv = ref(`${loadingLineH}; ${props.lineMaxH}; ${loadingLineH}`);
    const ayv = ref(`${loadingLineMarginTop}; ${loadingLineMarginTop - loadingLineResize}; ${loadingLineMarginTop}`);
    let x = 0;
    let begin = 0;
    const arr: Iloading[] = [];
    for (let i = 0; i < loadingLineCount; i++) {
      arr.push({
        x,
        y: loadingLineMarginTop,
        width: loadingLineW,
        height: loadingLineH,
        begin,
        dur: 0.6,
      });
      x += loadingLineW + loadingLineGap;
      begin += 0.15;
    }
    loadingLineArr.value = arr;
    svgRect.width = x - loadingLineGap;
    
    return {
      loadingLineArr,
      svgRect,
      ahv,
      ayv
    };
  },
});
</script>