import Vue from 'vue'
import VueRouter from 'vue-router'
import gql from 'graphql-tag'

import { createProvider } from '@/vue-apollo';
import store from '@/store';

import Home from '../views/Home.vue'
import Signin from '../views/Signin.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Signin
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
    if (to.fullPath.startsWith('/login')) {
        return next()
    }

    const apolloClient = createProvider().defaultClient

    if (to.fullPath.startsWith('/')) {
        try {
            const res = await apolloClient.query({
                query: gql`query q {
                    me {
                        id
                    }
                }`
            })

            if (!res.data.me) {
                return next({ name: 'Login' })
            }
            const { data: { user: details } } = await apolloClient.query({
                query: gql`query($id: ID!) {
                    user(id: $id) {
                        id email firstname lastname
                    }
                }`,
                variables: {
                    id: res.data.me.id
                }
            })
            console.log(details)
            store.commit('setUser', details)
            return next()
        } catch (e) {
            return next({ name: 'Login' })
        }
    }
    return next()
})


export default router
