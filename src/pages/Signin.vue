<template>
  <div class="un-auth-page">
    <v-layout row wrap fill-height light>
      <v-flex xs12 offset-md7 md5 d-flex light align-center class="main">
		    <v-layout row wrap justify-center>    
		    	<v-flex xs8>
		        <div class="text-xs-center pa-5">
		          <div class="headline mb-4">Sign In</div>
		          <v-form id="signin-form" v-model="formValid" @submit.prevent="userSignin">  
		          	<v-text-field
				          name="email"
				          type="text"
				          label="Email"
				          id="email"
				          v-model="email"
				          :rules="validRules.email"
				          autofocus
				          required
				          class="text-xs-left"
				        ></v-text-field>
				        <v-text-field
				          name="password"
				          type="password"
				          label="Password"
				          id="password"
				          v-model="password"
				          :rules="validRules.password"
				          required
				          class="text-xs-left"
				        ></v-text-field>
				        <v-alert type="error" :value="alert" transition="slide-y-transition" class="text-xs-left mb-3 form-message">{{ getError }}</v-alert>
				        <v-btn id="submit" type="submit" :disabled="!formValid" color="primary" class="mt-2">Sign In</v-btn>
					    </v-form>
					    <div class="links my-4">Or <router-link class="my-4" to="/signup">sign up</router-link></div>
		        </div>
		      </v-flex>
		    </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	name: 'Signin',
	data () {
		return {
			email: '',
			password: '',
			alert: false,
			formValid: false,
			validRules: {
				email: [
	        v => !!v || 'Email cannot be empty'
	      ],
	      password: [
	      	v => !!v || 'Password cannot be empty'
	      ]
	    }
		}
	},
	computed: {
		...mapGetters([
			'getError'
		])
	},
	watch: {
		getError (value) {
			if(value) this.alert = true
		},
		alert (value) {
			if(!value) this.$store.dispatch('setError', false)
		}
	},
	methods: {
		userSignin () {
			this.$store.dispatch('userSignin', {
				email: this.email,
				password: this.password
			})
		}
	}
}
</script>