// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtf-M1FHIRr4vxZlVRI79GfMktpgr6mh8",
  authDomain: "typingtext-136dd.firebaseapp.com",
  projectId: "typingtext-136dd",
  storageBucket: "typingtext-136dd.firebasestorage.app",
  messagingSenderId: "743649058188",
  appId: "1:743649058188:web:74239ee0073439010ccaa9",
  measurementId: "G-77WZNN1EFQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);