import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// keep your credentials 
const firebaseConfig = {
  apiKey: "AIzaSyCAJ1H0EVauah71yVIobVkX-7j95cGnugg",
  authDomain: "twiller-efad3.firebaseapp.com",
  projectId: "twiller-efad3",
  storageBucket: "twiller-efad3.firebasestorage.app",
  messagingSenderId: "859918928411",
  appId: "1:859918928411:web:ce59175ab44a67b2d086be",
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;