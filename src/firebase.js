// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAMJTkpKXIYMlsdzR3-SaR4jc5ygp6xMEg",
  authDomain: "profileinh.firebaseapp.com",
  projectId: "profileinh",
  storageBucket: "profileinh.appspot.com",
  messagingSenderId: "913340989135",
  appId: "1:913340989135:web:9c6a686861f40f589cc1ba"
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

export const db = firebaseApp.firestore();
export default firebase;


