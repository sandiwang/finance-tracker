import firebase from 'firebase'
import moment from 'moment'
import router from '@/router'

export const actions = {
	setLoading ({commit}, payload) {
		commit('setLoading', payload)
	},
	userSignup ({commit}, payload) {
		commit('setLoading', true)

		return firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
			.then(firebaseUser => {
				commit('setUser', firebaseUser)

				return firebase.database().ref(`/users/${firebaseUser.uid}`)
					.update({
						email: firebaseUser.email,
						firstname: payload.fname,
						lastname: payload.lname,
						username: firebaseUser.email,
						settings: {
							Send_bill_reminder: false,
							notifications: false
						}
					})
			})
			.then(() => {
				commit('setProfile', payload)
				commit('setLoading', false)
				commit('setError', null)
				router.push('/home')
			})
			.catch(err => {
				console.log(err);
				commit('setError', err.message)
				commit('setLoading', false)
			})
	},
	userSignin ({dispatch, commit}, payload) {
		commit('setLoading', true)
		return firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
			.then(firebaseUser => {
				commit('setUser', firebaseUser)
				commit('setError', null)

				router.push('/home')

				let spendingsTask = dispatch('spendings/getSpendings', firebaseUser, { root: true }),
						depositTask = dispatch('deposit/getDeposits', firebaseUser, { root: true }),
						billsTask = dispatch('bills/getBills', firebaseUser, { root: true }),
						profileTask = dispatch('users/getUserProfile', firebaseuser, { root: true })

				return Promise.all([spendingsTask, depositTask, billsTask, profileTask])
			  	.then(data => {
			  		dispatch('spendings/spendingsByCategory', data[0])
			  		dispatch('spendings/spendingsByMonth', data[0])
			  		dispatch('deposit/depositByMonth', data[1])
			  	})
			  	.then(() => dispatch('setLoading', false))				
			})
			.catch(err => {
				commit('setError', err.message)
				commit('setLoading', false)
			})
	},
	autoSignin ({commit}, payload) {
		commit('setUser', payload)
	},
	userSignout ({commit}) {
		firebase.auth().signOut()

		// reset state
		commit('setUser', null)		
		commit('bills/resetBills')
		commit('deposit/resetDeposit')
		commit('spendings/resetSpendings')
		commit('users/resetUsers')

		router.push('/')
	},

	reAuthenticateUser ({commit}, payload) {
		const credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, payload)
		return firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credential)
	},

	updateUserPassword ({commit}, payload) {
		return firebase.auth().currentUser.updatePassword(payload)
	},

	addNewCategory ({commit}, payload) {
		commit('setLoading', true)

		return firebase.database().ref('/categories')
			.push(payload)
			.then(() => commit('addNewCategory'))
			.catch(err => {
				throw new Error(`error when adding category: ${ err.code }: ${ err.message }`)
			})
	},
	addNotification ({commit}, payload) {
		commit('addNotification', payload)
	}
}