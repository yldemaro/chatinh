// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyAMJTkpKXIYMlsdzR3-SaR4jc5ygp6xMEg",
  authDomain: "profileinh.firebaseapp.com",
  projectId: "profileinh",
  storageBucket: "profileinh.appspot.com",
  messagingSenderId: "913340989135",
  appId: "1:913340989135:web:9c6a686861f40f589cc1ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);