// This a service worker file for receiving push notifitications.
// See `Access registration token section` @ https://firebase.google.com/docs/cloud-messaging/js/client#retrieve-the-current-registration-token

// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');


// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
    apiKey: "AIzaSyDC9KmUU5LO6PD6FuPg4ZKtqb-mIETL1kw",
    authDomain: "klima-app-duesseldorf.firebaseapp.com",
    projectId: "klima-app-duesseldorf",
    storageBucket: "klima-app-duesseldorf.appspot.com",
    messagingSenderId: "629233633214",
    appId: "1:629233633214:web:38c17cf17ed12bc364dbef"
};


firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle incoming messages while the app is not in focus (i.e in the background, hidden behind other tabs, or completely closed).
messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message ', payload);

});