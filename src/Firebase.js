import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDC9KmUU5LO6PD6FuPg4ZKtqb-mIETL1kw",
    authDomain: "klima-app-duesseldorf.firebaseapp.com",
    projectId: "klima-app-duesseldorf",
    storageBucket: "klima-app-duesseldorf.appspot.com",
    messagingSenderId: "629233633214",
    appId: "1:629233633214:web:38c17cf17ed12bc364dbef",
    measurementId: "G-PLEFY32CK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };