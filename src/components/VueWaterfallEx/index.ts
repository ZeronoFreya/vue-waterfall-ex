import VueWaterfallEx from './src/VueWaterfallEx.vue'

(VueWaterfallEx as any).install = (vue: any) => {
  vue.component(VueWaterfallEx.name, VueWaterfallEx)
}

export default VueWaterfallEx