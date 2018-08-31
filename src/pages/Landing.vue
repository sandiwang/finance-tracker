<template>
  <div class="un-auth-page" id="landing-page">
    <v-layout row wrap fill-height>
      <v-flex xs12 d-flex light align-center>
        <div class="text-xs-center white--text">
          <div class="headline">Personal Finance Tracker</div>
          <ul class="landing-nav">
            <li><router-link to="/signup">Sign Up</router-link></li>
            <li><router-link to="/signin">Sign In</router-link></li>
          </ul>
        </div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: 'Landing',
  data () {
    return {}
  }
}
</script>
