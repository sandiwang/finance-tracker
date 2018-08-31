<template>
  <div class="un-auth-page">
  	<v-layout row wrap fill-height light>
      <v-flex xs12 offset-md7 md5 d-flex light align-center class="main">
		    <v-layout row wrap justify-center>    
		    	<v-flex xs8>
		    		<v-form id="signup-form" v-model="formValid" @submit.prevent="userSignup">
		        	<v-layout wrap>
			        	<v-flex xs12 class="px-5 text-xs-center">
			        		<div class="headline mb-4">Sign Up</div>
			        		<v-layout wrap>
			        			<v-flex xs6 class="pr-1 text-xs-left">
			        				<v-text-field
							        	name="fname"
							        	type="text"
							        	label="First Name"
							        	id="fname"
							        	v-model="fname"
							        	:rules="validRules.name"
							        	required
							        ></v-text-field>
			        			</v-flex>
			        			<v-flex xs6 class="pl-1 text-xs-left">
			        				<v-text-field
							        	name="lname"
							        	type="text"
							        	label="Last Name"
							        	id="lname"
							        	v-model="lname"
							        	:rules="validRules.name"
							        	required
							        ></v-text-field>
			        			</v-flex>
			        		</v-layout>
			        	</v-flex>
			        	<v-flex xs12 class="text-xs-center px-5">
			          	<v-text-field
					          name="email"
					          type="text"
					          label="Email"
					          id="email"
					          v-model="email"
					          :rules="validRules.email"
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
					          hint="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
					          persistent-hint
					          required
					          class="text-xs-left"
					        ></v-text-field>
					        <v-text-field
					        	name="confirmPassword"
					        	type="password"
					        	label="Confirm Password"
					        	id="confirmPassword"
					        	v-model="passwordConfirm"
					        	required
					        	class="text-xs-left mt-3"
					        	:rules="validRules.confirmPassword"
					        ></v-text-field>
					        <v-alert type="error" :value="alert" transition="slide-y-transition" class="text-xs-left mb-3 form-message">{{ getError }}</v-alert>
					        <v-btn type="submit" :disabled="!formValid" color="primary" class="mt-2">Sign Up</v-btn><br>
						    	<div class="links my-4">Or <router-link class="my-4" to="/signin">sign in</router-link></div>
			        	</v-flex>
			      	</v-layout>
			      </v-form>
			    </v-flex>
		    </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	name: 'Signup',
	data () {
		return {
			email: '',
			password: '',
			passwordConfirm: '',
			fname: '',
			lname: '',
			alert: false,
			formValid: false,
			validRules: {
				name: [
	        v => !!v || 'Name cannot be empty'
	      ],
				email: [
	        v => !!v || 'Email cannot be empty',
	        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Email not valid'
	      ],
	      password: [
	      	v => !!v || 'Password cannot be empty',
	      	v => /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(v) || 'Password not valid'
	      ],
	      confirmPassword: [
	      	v => (v === this.password) || 'Passwords don\'t match'
	      ]
			},
			defaultBanner: '/static/banner-default.jpg'
		}
	},
	computed: {
		...mapGetters([
			'getError'
		]),
		comparePasswords () {
			return this.password === this.passwordConfirm
		}
	},
	methods: {
		userSignup () {
			if( this.password !== this.passwordConfirm ) return;
			this.$store.dispatch('userSignup', {
				email: this.email,
				password: this.password,
				fname: this.fname,
				lname: this.lname,
				banner: this.defaultBanner,
			})
		}
	},
	watch: {
		getError (value) {
			if(value) this.alert = true
		},
		alert (value) {
			if(!value) this.$store.dispatch('setError', null)
		}
	}
}
</script>