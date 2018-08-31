<template>
  <div id="app">
    <v-snackbar
      :timeout="notificationTimeout"
      top
      right
      v-model="notificationsSnackbar"
      color="blue lighten-1"
      light
    >
      <div v-if="this.notifications">{{ this.notifications.title }}</div>
      <div v-if="this.notifications">{{ this.notifications.body }}</div>
    </v-snackbar>
   
    <v-container v-if="isLoading && isAuthenticated" id="app-loading" fluid justify-center align-center align-content-center fill-height>
      <v-progress-circular indeterminate color="light-blue darken-3" size="50" class="my-5"></v-progress-circular>
    </v-container>
   
    <v-app v-else>
      <v-navigation-drawer
        fixed
        v-model="drawer"
        app
        width="200"
        dark
        class="blue darken-3"
        v-if="isAuthenticated"
      > 
        <v-list dense>
          <v-list-tile>
            <v-list-tile-title>Personal Finance</v-list-tile-title>
          </v-list-tile>
          <v-list-tile v-for="item in menuItems" :key="item.path" :to="item.path">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>

      <v-toolbar v-if="isAuthenticated" color="white" height="48" dense fixed light app>
          <v-toolbar-side-icon class="grey--text text--darken-3" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
          <v-spacer></v-spacer>

          <v-btn flat icon color="grey darken-1" title="Profile" to="/profile">
            <v-avatar
              size="30px"
              class="grey lighten-4"
            >
              <img v-if="getProfileImage" :src="getProfileImage" :alt="getUser.displayName">
              <img v-else src="/static/user-avartar-default-sm.png">
            </v-avatar>
          </v-btn>
          <v-btn flat small color="grey darken-1" @click="userSignout" class="ml-0">Log Out</v-btn>
        </v-toolbar>

      <v-content :class="{ 'blue': !isAuthenticated }">
        <v-container fluid>
          <v-layout align-center class="pb-5">
            <router-view/>
          </v-layout>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'app',
  metaInfo: {
    link: [
      { rel: 'manifest', href: '../static/manifest.json' }
    ]
  },
  data () {
    return {
      latestTransactions: 'The last 5 transactions',
      drawer: null,
      notifications: null,
      notificationTimeout: 4000,
      notificationsSnackbar: false
    }
  },
  watch: {
    getNotification (value) {
      if (value.length > 0) {
        this.notificationsSnackbar = true
        this.notifications = value[value.length - 1]
      } else {
        this.notificationsSnackbar = false
      }
    }
  },
  computed: {
    ...mapGetters("users", [
      'getProfile'
    ]),
    isLoading () {
      return this.$store.getters.getLoading
    },
    isAuthenticated () {
      return this.$store.getters.getUser !== null && this.$store.getters.getUser !== undefined
    },
    getUser () {
      return this.$store.getters.getUser
    },
    menuItems () {
      if(this.isAuthenticated) {
        return [
          { title: 'Home', path: '/home', icon: 'home'},
          { title: 'Spendings', path: '/spendings', icon: 'show_chart' },
          { title: 'Deposit', path: '/deposit', icon: 'monetization_on' },
          { title: 'Bills', path: '/bills', icon: 'list' }
        ]
      } else {
        return [
          { title: 'Home', path: '/' },
          { title: 'Sign Up', path: '/signup' },
          { title: 'Sign In', path: '/signin' }
        ]
      }
    },
    getProfileImage () {
      //if (!this.getProfile) return 

      for(let item of this.getProfile) {
        if(item.title === 'image') return item.value
      }
    },
    getNotification () {
      return this.$store.getters.getNotification
    }
  },
  methods: {
    formatItemName: (name) => name.split('_')[1],
    userSignout () {
      this.$store.dispatch('userSignout')
    },
    goTo (route) {
      this.$router.push(route)
    }
  }
}
</script>

<style>

@import 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons';

/*
#app {
  color: lightblue;
}
*/
</style>
