import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyDEoZJ_gA-aFQGscM4FwuSrvXx1R-0CzYs",
  authDomain: "gameplancreator-ts.firebaseapp.com",
  projectId: "gameplancreator-ts",
  storageBucket: "gameplancreator-ts.appspot.com",
  messagingSenderId: "69437569406",
  appId: "1:69437569406:web:d806b1718dc24439919b2f",
  measurementId: "G-T355GTSWZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const dataBase = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);




