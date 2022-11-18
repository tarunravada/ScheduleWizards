import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyDcQ7ImSWy7ceECISHUCieM73L0ctgK8NM",
  authDomain: "schedule-wizard-6112-3f274.firebaseapp.com",
  projectId: "schedule-wizard-6112-3f274",
  storageBucket: "schedule-wizard-6112-3f274.appspot.com",
  messagingSenderId: "460955374789",
  appId: "1:460955374789:web:5faad7a3124d87696e4cac"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar');
const auth = getAuth();

export {auth, provider}