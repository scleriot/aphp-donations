import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        user: null
    },
    mutations: {
        setUser(state, user) {
            console.log("user", user)
            state.user = user
        },
        logout(state) {
            state.user = null
        }
    },
    actions: {
        login({ commit }, { user, jwt }) {
            commit('setUser', user)
            localStorage.setItem("jwt", jwt)
        },
        logout({ commit }) {
            commit('logout')
            localStorage.removeItem("jwt")
        }
    },
    modules: {
    }
})
