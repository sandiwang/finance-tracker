import Vue from 'vue'
import Vuex from 'vuex'

import { state } from './state'
import { mutations } from './mutations'
import { actions } from './actions'
import { getters } from './getters'

import users from './modules/users'
import spendings from './modules/spendings'
import deposit from './modules/deposit'
import bills from './modules/bills'

Vue.use(Vuex)

export const store = new Vuex.Store({
	modules: {
		users,
		spendings,
		deposit,
    bills,
  },
  state,
  mutations,
  actions,
  getters
})