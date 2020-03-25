import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import { createProvider } from './vue-apollo'
import store from './store'

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  apolloProvider: createProvider(),
  store,
  render: h => h(App)
}).$mount('#app')
