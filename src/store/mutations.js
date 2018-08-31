import moment from 'moment'
import * as initialState from './state.js';

export const mutations = {
	setUser (state, payload) {
		state.user = payload
	},
	setError (state, payload) {
		state.error = payload
	},
	setLoading (state, payload) {
		state.loading = payload
	},
	addNewCategory (state, payload) {
		state.categories.push(payload)
	},
	addNotification (state, payload) {
		state.notification.push(payload)
	}
}