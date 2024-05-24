// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDT4iaPdleCjt7K2AYVDfEaZOi6UqDHCDU",
  authDomain: "lory-c64ec.firebaseapp.com",
  projectId: "lory-c64ec",
  storageBucket: "lory-c64ec.appspot.com",
  messagingSenderId: "371071401749",
  appId: "1:371071401749:web:f5f5ef959488fcfd78b31c",
  measurementId: "G-TXBTQ3L6XE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

// Initialize Firebase Storage
const storage = firebase.storage();