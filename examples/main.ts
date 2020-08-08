import Vue from 'vue'
import "./assets/style/style.css"
import App from './App.vue'

import VueWaterfallEx from "@/index";
Vue.config.productionTip = false
Vue.use(VueWaterfallEx)
new Vue({
  render: h => h(App),
}).$mount('#app')
