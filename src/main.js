// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueFire from 'vuefire'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import { store } from './store'
import firebase from 'firebase'
import { firebaseApp } from './firebase'
import notifications from './notifications'
import moment from 'moment'
import Chart from 'chart.js'
import VueChart from 'vue-chartjs'
import '../node_modules/vuetify/dist/vuetify.min.css'
import './styles/global.scss'

Vue.use(VueFire)
Vue.use(Vuetify, {
	theme: {
		primary: '#0277BD'
	}
})

// Vue.prototype.$moment = moment

Vue.config.productionTip = false

// firebase.initializeApp(firebaseConfig)

/* eslint-disable no-new */
const unsubscribe = firebase.auth()
	.onAuthStateChanged((firebaseUser) => {
		new Vue({
		  el: '#app',
		  router,
		  store,
		  template: '<App/>',
		  components: { App },
		  created () {
		  	let spendingsTask, depositTask, profileTask, billTask

		  	store.dispatch('setLoading', true)
		  	store.dispatch('autoSignin', firebaseUser)
		  	
		  	if(firebaseUser) {

		  		// initiate notifications
				  notifications.init(firebaseUser.uid)
				  notifications.addEventOnTokenRefresh()
				  notifications.addEventOnMessage(store)

				  // get user data from database
		  		spendingsTask = store.dispatch('spendings/getSpendings', firebaseUser)		  		
			  	depositTask = store.dispatch('deposit/getDeposits', firebaseUser)
			  	billTask = store.dispatch('bills/getBills', firebaseUser)
			  	profileTask= store.dispatch('users/getUserProfile', firebaseUser.uid)

			  	Promise.all([spendingsTask, depositTask, billTask, profileTask])
				  	.then(() => store.dispatch('setLoading', false))
		  	}
		  }
		})
		unsubscribe()
	})


