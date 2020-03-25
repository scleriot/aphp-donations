import Vue from 'vue'
import vueKanban from 'vue-kanban'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import { createProvider } from './vue-apollo'
import store from './store'
import "./style.css"

Vue.config.productionTip = false

Vue.use(vueKanban)

new Vue({
  router,
  vuetify,
  apolloProvider: createProvider(),
  store,
  render: h => h(App)
}).$mount('#app')
