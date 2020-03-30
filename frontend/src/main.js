import Vue from 'vue'
import vueKanban from 'vue-kanban'

import 'unfetch/polyfill'

import VuetifyDialog from 'vuetify-dialog'
import 'vuetify-dialog/dist/vuetify-dialog.css'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import { createProvider } from './vue-apollo'
import store from './store'
import "./scss/style.scss"

Vue.config.productionTip = false

Vue.use(VuetifyDialog, {
  context: {
    vuetify
  }
})

Vue.use(vueKanban)

new Vue({
  router,
  vuetify,
  apolloProvider: createProvider(),
  store,
  render: h => h(App)
}).$mount('#app')
