import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getDatabase, ref } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDEoZJ_gA-aFQGscM4FwuSrvXx1R-0CzYs",
  authDomain: "gameplancreator-ts.firebaseapp.com",
  projectId: "gameplancreator-ts",
  storageBucket: "gameplancreator-ts.appspot.com",
  messagingSenderId: "69437569406",
  appId: "1:69437569406:web:d806b1718dc24439919b2f",
  measurementId: "G-T355GTSWZM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Настраиваем auth для работы с редиректом
// Убеждаемся, что auth знает о текущем домене
if (typeof window !== 'undefined') {
  const currentOrigin = window.location.origin;
  console.log("Firebase auth initialized for origin:", currentOrigin);
}

// Настраиваем Google провайдер для редиректа
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Настраиваем Facebook провайдер
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');
export const dataBase = getFirestore(app);
export const storage = getStorage(app);
export const realDataBase = getDatabase(app); // Real DataBase
export const dataRef = ref(realDataBase); // Real DataBase
export const teamsRef = (teamsRef: string) => ref(realDataBase, `teams/${teamsRef}`);
export const playersRef = (playersRef: string) => ref(realDataBase, `players/${playersRef}`);
export const gamesRef = (gamesRef: string) => ref(realDataBase, `games/${gamesRef}`);

// const analytics = getAnalytics(app);
