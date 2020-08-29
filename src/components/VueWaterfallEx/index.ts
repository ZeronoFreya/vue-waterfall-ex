import VueWaterfallEx from './VueWaterfallEx.vue'

(VueWaterfallEx as any).install = (Vue: any) => {
  Vue.component(VueWaterfallEx.name, VueWaterfallEx)
}

export default VueWaterfallEx