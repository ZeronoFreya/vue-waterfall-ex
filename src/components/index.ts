// import Vue from "vue";
import VueWaterfallEx from './VueWaterfallEx'

const components = [
  VueWaterfallEx
]

const install = (Vue: any) => {
  if ((install as any).installed) return
  (install as any).installed = true
  // 遍历并注册全局组件
  components.map(component => {
      Vue.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}

export default {
    // 导出的对象必须具备一个 install 方法
    install,
    // 组件列表
    ...components
}