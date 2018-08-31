const functions = require('firebase-functions')

const admin = require('firebase-admin')


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp(functions.config().firebase);

exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref);
  });
});

exports.makeUppercase = functions.database.ref('/messages/{pushId}/original').onWrite((event) => {
  // Grab the current value of what was written to the Realtime Database.
  const original = event.data.val();
  console.log('Uppercasing', event.params.pushId, original);
  const uppercase = original.toUpperCase();
  // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to the Firebase Realtime Database.
  // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
  return event.data.ref.parent.child('uppercase').set(uppercase);
});

exports.fcmSend = functions.database.ref('/messages/{userId}/{messageId}').onCreate(event => {
  const message = event.data.val()
  const messageId = event.params.messageId
  const userId  = event.params.userId

  const payload = {
          notification: {
            title: messageId,
            body: message
          }
        }

   admin.database()
        .ref(`/fcmTokens/${userId}`)
        .once('value')
        .then(token => token.val() )
        .then(userFcmToken => {
          console.log('userFcmToken:', userFcmToken)
          console.log('payload:', payload)
          return admin.messaging().sendToDevice(userFcmToken, payload)
        })
        .then(res => {
          console.log("Sent Successfully", res);
        })
        .catch(err => {
          console.log('something wron when sending notifications:', err);
        });
})