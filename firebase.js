// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdIBsqIDIPtHok3PgOHKtjoGn0hFFyVYY",
  authDomain: "flashcardsaas-82d0c.firebaseapp.com",
  projectId: "flashcardsaas-82d0c",
  storageBucket: "flashcardsaas-82d0c.appspot.com",
  messagingSenderId: "818598937894",
  appId: "1:818598937894:web:5f45bc3ca05448f6392de7",
  measurementId: "G-29QQJWXZJT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {db}