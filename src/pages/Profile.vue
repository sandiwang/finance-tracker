<template>
  <div class="component">
    <v-snackbar
      :timeout="updateTimeout"
      top
      v-model="updateSnackbar"
      color="green"
      auto-height
    >
      {{ updateMessage }}
      <v-btn flat color="white" @click.native="updateSnackbar = false">Close</v-btn>
    </v-snackbar>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card class="profile-main-card" color="white">
          <v-layout row pb-2>
            <v-flex xs12>
              <v-parallax id="userBgImgConatiner" :src="userBanner" height="220" @mouseover="showEditBgImg = !showEditBgImg" @mouseout="showEditBgImg = !showEditBgImg">
                <div v-show="showEditBgImg" id="userBgImgOverlay" class="text-xs-center" style="height: 220px; line-height: 220px;" @click.stop="showUploadDialog"><v-icon>photo_camera</v-icon></div>
              </v-parallax>
            </v-flex>
          </v-layout>
          <v-layout row pb-2>
            <v-flex xs2 offset-xs1 class="pl-3">
              <v-card class="card-avartar-main" width="150" height="150">
                <div id="userProfileImgConatiner" @mouseover="userProfileImg = !userProfileImg" @mouseout="userProfileImg = !userProfileImg">
                  <v-card-media v-if="getUserAvartar" :src="getUserAvartar" height="150"></v-card-media>
                  <v-card-media v-else src="/static/user-avartar-default.png" height="150"></v-card-media>
                  <div v-show="userProfileImg" id="userProfileImgOverlay" class="text-xs-center" style="height: 150px; line-height: 150px;" @click.stop="showUploadProfileDialog"><v-icon>photo_camera</v-icon></div>
                </div>
              </v-card>
            </v-flex>
            <v-flex xs4 class="pt-3">
              <div class="headline">
                {{ userDisplayInfo.firstname }} {{ userDisplayInfo.lastname }}
              </div>
              <div class="subheading grey--text text--darken-1">
                {{ userDisplayInfo.email }}
              </div>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
      <v-flex xs10 offset-xs1 class="mt-5">
        <v-container fluid grid-list-md>  
          <v-layout row wrap>
            <v-flex d-flex xs8>

              <v-layout row wrap>
                <v-flex xs12>
                  <div class="subheading grey--text text--darken-1">Profile</div>
                  <v-card color="white" class="text-xs-center pa-3 mb-3 mt-2">
                    <v-form @submit.prevent="updateProfile()">
                      <v-list two-line>
                        <v-list-tile v-for="item in getProfile" v-if="item.title !== 'image' && item.title !== 'settings' && item.title !== 'banner'" :key="item.title">
                          <v-list-tile-content>
                            <v-text-field 
                              v-if="item.title === 'password'"
                              :label="item.title | formatProfile"
                              no-resize
                              v-model="item.value"
                              :append-icon="peekPassword ? 'visibility' : 'visibility_off'"
                              :append-icon-cb="() => { return peekPassword = !peekPassword }"
                              :type="peekPassword ? 'password' : 'text'"
                            ></v-text-field>
                            <v-text-field
                              v-else
                              :label="item.title | formatProfile"
                              no-resize
                              v-model="item.value"
                            ></v-text-field>
                          </v-list-tile-content>
                        </v-list-tile>                  
                      </v-list>

                      <v-btn type="submit" dark class="mb-3" color="primary" :loading="updating">
                        Save Changes
                      </v-btn>
                    </v-form>
                  </v-card>
                </v-flex>
              </v-layout>

            </v-flex>
            <v-flex d-flex xs4>
              <v-layout row wrap>

                <v-flex xs12>
                  <div class="subheading grey--text text--darken-1">Settings</div>

                  <v-card color="white" class="pa-3 mb-3 mt-2">
                    <template>
                      <v-data-table
                        :items="userSettings"
                        hide-actions
                        hide-headers
                        disable-initial-sort
                        class="settings-table"
                      >
                        <template slot="items" slot-scope="props">
                          <td>{{ props.item.title | formatSettings }}</td>
                          <td class="text-xs-right">
                            <v-switch hide-details color="light-blue darken-3" v-model="props.item.value" @change="updateSetting(props.item)"></v-switch>
                          </td>
                        </template>
                      </v-data-table>
                    </template>
                  </v-card>
                </v-flex>

                <v-flex xs12 v-if="isPasswordAuthenticated">
                  <div class="subheading grey--text text--darken-1">Change Password</div>

                  <v-card color="white" class="text-xs-center py-2 mb-2 mt-2">
                    <v-form @submit.prevent="changePassword()">
                      <v-list two-line>  
                        <v-list-tile class="text-xs-right">
                          <v-text-field
                            label="Old Password"
                            no-resize
                            v-model="changePasswordForm.old"
                            type="password"
                          ></v-text-field>
                        </v-list-tile>
                        <v-list-tile class="text-xs-right">
                          <v-text-field
                            label="New Password"
                            no-resize
                            v-model="changePasswordForm.new"
                            type="password"
                          ></v-text-field>
                        </v-list-tile>
                        <v-list-tile class="text-xs-right">
                          <v-text-field
                            label="Confirm New Password"
                            no-resize
                            v-model="changePasswordForm.confirmNew"
                            type="password"
                          ></v-text-field>
                        </v-list-tile>
                      </v-list>

                      <v-btn type="submit" dark class="mb-3" color="orange darken-1" :loading="updating">Change Password</v-btn>
                      <v-alert :value="changePasswordForm.errMsg" type="error" outline class="mx-3 mb-3">
                        {{ changePasswordForm.errMsg }}
                      </v-alert>
                      <v-alert :value="changePasswordForm.successMsg" type="success" outline class="mx-3 mb-3">
                        {{ changePasswordForm.successMsg }}
                      </v-alert>
                    </v-form>
                  </v-card>
                </v-flex>
              </v-layout>
              
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>

    <v-dialog v-model="editBgImgDialog" max-width="500px">
      <v-card class="pa-4">
        <v-form @submit.prevent="updateBanner">
          <v-container fluid grid-list-md>
            <v-layout wrap>
              <v-flex xs12 class="mb-2">
                <div class="headline blue--text text--darken-1">Upload Cover Photo</div>
              </v-flex>
              <v-flex v-if="!newBannerUrl" xs12 class="mt-2">
                <file-upload title="Drag and drop images here." :reset="bannerUploadReset" :url="bannerUploadUrl" v-on:uploadSuccess="bannerUploadSuccess"></file-upload>
              </v-flex>
              <v-flex v-else xs12 class="text-xs-center mt-2 upload-preview-wrapper">
                <img :src="newBannerUrl">
                <div class="my-1 restart">or <span v-on:click="startOver">choose another one</span></div>
              </v-flex>
            </v-layout>
            <v-layout justify-center class="mb-2 mt-3">
              <v-btn color="grey darken-1" flat @click.stop="cancelUploadBanner">Cancel</v-btn>
              <v-btn color="primary" type="submit" :disabled="!newBannerUrl">Update</v-btn>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editProfileImgDialog" max-width="500px">
      <v-card class="pa-4">
        <v-form @submit.prevent="updateProfileImg">
          <v-container fluid grid-list-md>
            <v-layout wrap>
              <v-flex xs12 class="mb-2">
                <div class="headline blue--text text--darken-1">Upload Profile Picture</div>
              </v-flex>
              <v-flex v-if="!newProfileUrl" xs12 class="mt-2">
                <file-upload title="Drag and drop images here." :reset="profileImgUploadReset" :url="profileUploadUrl" v-on:uploadSuccess="profileImgUploadSuccess"></file-upload>
              </v-flex>
              <v-flex v-else xs12 class="text-xs-center mt-2 upload-preview-wrapper">
                <img :src="newProfileUrl">
                <div class="my-1 restart">or <span v-on:click="startOver">choose another one</span></div>
              </v-flex>
            </v-layout>
            <v-layout justify-center class="mb-2 mt-3">
              <v-btn color="grey darken-1" flat @click.stop="cancelUploadProfileImg">Cancel</v-btn>
              <v-btn color="primary" type="submit" :disabled="!newProfileUrl">Update</v-btn>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import firebase from 'firebase'
import fileUpload from '../components/fileUpload.vue'
import notifications from '../notifications'
import { mapGetters } from 'vuex'

export default {
  name: 'Profile',
  components: {
    fileUpload
  },
  data () {
    return {
      showEditBgImg: false,
      editBgImgDialog: false,
      updating: false,
      updateTimeout: 1500,
      updateMessage: 'Update Successful!',
      updateSnackbar: false,
      peekPassword: true,
      userDisplayInfo: {},
      newBannerUrl: null,
      newProfileUrl: null,
      bannerUploadReset: false,
      profileImgUploadReset: false,
      userProfileImg: false,
      editProfileImgDialog: false,
      defaultBanner: '/static/banner-default.jpg',
      changePasswordForm: {
        old: '',
        new: null,
        confirmNew: null,
        errMsg: null,
        successMsg: null
      }
    } 
  },
  created () {
    this.getUserDisplayInfo()
  },
  mounted () {
  },
  computed: {
    ...mapGetters("users", [
      'getProfile',
      'getUserBanner',
      'getUserAvartar'
    ]),

    loading () {
      return this.$store.getters.getLoading
    },
    getUser () {
      return this.$store.getters.getUser
    },

    // check if user registered account with email/password method
    isPasswordAuthenticated () {
      const providerData = this.getUser.providerData
      for (let provider of providerData) {
        if (provider.providerId === 'password') {
          return true
        }
      }

      return false
    },

    userSettings() {
      let settings = []
      for(let item in this.userDisplayInfo.settings) {
        settings.push({
          title: item,
          value: this.userDisplayInfo.settings[item]
        })
      }

      return settings
    },

    userBanner () {
      return this.getUserBanner || this.defaultBanner
    },

    bannerUploadUrl () {
      return `/users/${this.getUser.uid}/profile/banner`
    },
    profileUploadUrl () {
      return `/users/${this.getUser.uid}/profile/image`
    }
  },
  filters: {
    formatProfile (value) {
      let v = value.toLowerCase()

      if (v === 'firstname') {
        return 'First Name'
      } else if (v === 'lastname') {
        return 'Last Name'
      } else {
        return v.charAt(0).toUpperCase() + v.slice(1)
      }
    },
    formatSettings (value) {
      let v = value.replace(/_/g, ' ')
      return v.charAt(0).toUpperCase() + v.slice(1)
    }
  },
  methods: {
    getUserDisplayInfo () {
      for(let item of this.getProfile) {
        this.userDisplayInfo[item.title] = item.value
      }
    },

    updateProfile () {
      let uid = this.getUser.uid,
          updateObj = {},
          updateDb,
          updateStore

      this.updating = true

      for(let item of this.getProfile) {
        updateObj[item.title] = item.value      
      }

      updateDb = firebase.database().ref(`users/${uid}`).update(updateObj)
      updateStore = this.$store.dispatch('users/getUserProfile', uid)

      return Promise.all([updateDb, updateStore])
        .then(() => {
          this.updating = false
          this.updateSnackbar = true
        })
    },

    changePassword () {
      const newPsd = this.changePasswordForm.new.trim()
      const confirmNewPsd = this.changePasswordForm.confirmNew.trim()

      if ((newPsd !== confirmNewPsd) || newPsd === '' ) {
        this.changePasswordForm.errMsg = 'New Passwords don\'t match. Please make sure you put in the correct new password twice.'
        return
      }

      return this.$store.dispatch('reAuthenticateUser', this.changePasswordForm.old)
        .then(data => this.$store.dispatch('updateUserPassword', newPsd))
        .then(data => {
          this.changePasswordForm.old = ''
          this.changePasswordForm.new = null
          this.changePasswordForm.confirmNew = null
          this.changePasswordForm.successMsg = 'Your password has been successfully updated.'
        })
        .catch(err => {
          this.changePasswordForm.errMsg = err.message
        })
    },

    updateSetting (item) {
      let uid = this.getUser.uid,
          updateItem = {
            uid,
            item: {
              settings: {}
            }
          }

      updateItem.item.settings[item.title] = item.value

      return this.$store.dispatch('users/updateUserSettings', updateItem)
        .then(() => {
          this.updateSnackbar = true

          if (item.title === 'notifications') {
            if (item.value === false)
              notifications.deleteToken()
            else
              notifications.requestPermission()
          }
        })
    },
    requestNotificationPermission() {
      
    },
    deleteNotificationToken () {

    },
    setTokenSentToServer(sent) {

    },
    showUploadDialog () {
      this.editBgImgDialog = !this.editBgImgDialog
      this.bannerUploadReset = false
    },
    showUploadProfileDialog () {
      this.editProfileImgDialog = !this.editProfileImgDialog
      this.profileImgUploadReset = false
    },
    bannerUploadSuccess (data) {
      this.newBannerUrl = data
    },
    profileImgUploadSuccess (data) {
      this.newProfileUrl = data
    },
    cancelUploadBanner () {
      this.newBannerUrl = null
      this.editBgImgDialog = false
      this.bannerUploadReset = true
    },
    cancelUploadProfileImg () {
      this.newProfileUrl = null
      this.editProfileImgDialog = false
      this.profileImgUploadReset = true
    },
    updateBanner () {
      let uid = this.getUser.uid,
          updateItem = {
            uid,
            item: {
              banner: this.newBannerUrl
            }
          }

      return this.$store.dispatch('users/updateUserProfile', updateItem)
        .then(() => {
          this.newBannerUrl = null
          this.editBgImgDialog = false
        })
    },
    updateProfileImg () {
      let uid = this.getUser.uid,
          updateItem = {
            uid,
            item: {
              image: this.newProfileUrl
            }
          }

      return this.$store.dispatch('users/updateUserProfile', updateItem)
        .then(() => {
          this.newProfileUrl = null
          this.editProfileImgDialog = false
        })
    },
    startOver () {
      this.newProfileUrl = null
      this.newBannerUrl = null
      this.bannerUploadReset = true
      this.profileImgUploadReset = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .application .theme--light.table tbody tr:hover:not(.datatable__expand-row), .theme--light .table tbody tr:hover:not(.datatable__expand-row) {
    background: none;
  }

  #userBgImgConatiner, #userProfileImgConatiner {
    position: relative;
  }

  #userBgImgOverlay, #userProfileImgOverlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(121,121,121,0.7);
    cursor: pointer;
  }

  #userBgImgOverlay i, #userProfileImgOverlay i {
    font-size: 50px;
  }
  
</style>
