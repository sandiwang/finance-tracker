import { firebaseConfig,firebaseCloudMessaging } from './config'
import { firebaseApp } from './firebase'

const messaging = firebaseApp.messaging()
const db = firebaseApp.database()

messaging.usePublicVapidKey(firebaseCloudMessaging.vapidKey)

export default {
  uid: null,
  message: null,
  init (uid) {
    this.uid = uid || null
  },
  getMessage: () => this.message,
  reset () {
  	messaging.getToken().then(currentToken => {
      if (currentToken) {
        this.sendTokenToServer(currentToken);
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.')
        // Show permission UI.
        this.setTokenSentToServer(false)
      }
    }).catch(err => {
      console.log('An error occurred while retrieving token. ', err)
      this.setTokenSentToServer(false)
    })
  },
  addEventOnTokenRefresh () {
    messaging.onTokenRefresh(function() {
    	messaging.getToken().then(refreshedToken => {
        console.log('Token refreshed.')
        // Indicate that the new Instance ID token has not yet been sent to the
        // app server.
        this.setTokenSentToServer(false);
        // Send Instance ID token to app server.
        this.sendTokenToServer(refreshedToken);
        // [START_EXCLUDE]
        // Display new Instance ID token and clear UI of all previous messages.
        this.reset();
        // [END_EXCLUDE]
      }).catch(err => {
        console.log('Unable to retrieve refreshed token ', err)
      })
    })
  },
  addEventOnMessage (store) {
  	messaging.onMessage(payload => {
	    console.log('Message received. ', payload.notification)
      store.dispatch('addNotification', payload.notification)
	  })
  },
  sendTokenToServer (currentToken) {
    if (!this.isTokenSentToServer()) {
      let token = { [this.uid]: currentToken }
      console.log('Sending token to server...', token)
      // TODO(developer): Send the current token to your server.
      this.setTokenSentToServer(true)

      return db.ref('fcmTokens/').update(token)
    } else {
      console.log('Token already sent to server so won\'t send it again ' +
          'unless it changes');
    }
  },
  isTokenSentToServer: () => window.localStorage.getItem('sentToServer') === 1,
  setTokenSentToServer (sent) {
    window.localStorage.setItem('sentToServer', sent ? 1 : 0)
  },
  requestPermission () {
    console.log('Requesting permission...')
    // [START request_permission]
    messaging.requestPermission().then(() => {
      console.log('Notification permission granted.')
      // TODO(developer): Retrieve an Instance ID token for use with FCM.
      // [START_EXCLUDE]
      // In many cases once an app has been granted notification permission, it
      // should update its UI reflecting this.
      this.reset()
      // [END_EXCLUDE]
    }).catch(err => {
      console.log('Unable to get permission to notify.', err)
    });
    // [END request_permission]
  },
  deleteToken () {
    messaging.getToken().then(currentToken => {
      messaging.deleteToken(currentToken).then(() => {
        console.log('Token deleted.')
        this.setTokenSentToServer(false)
        // [START_EXCLUDE]
        // Once token is deleted update UI.
        this.reset();
        // [END_EXCLUDE]
      }).catch(err => {
        console.log('Unable to delete token. ', err)
      });
      // [END delete_token]
    }).catch(err => {
      console.log('Error retrieving Instance ID token. ', err)
    });
  },
  receiveMessage () {
    messaging.onMessage(payload => {
      console.log('Message received:,', paylod)
      this.messages.push(payload)
    })
  }
}