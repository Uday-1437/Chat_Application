import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyB3cPVHNpOD6dmu8x6NYUJWUP2-er4aebM",
  authDomain: "reactchat-dc00d.firebaseapp.com",
  projectId: "reactchat-dc00d",
  storageBucket: "reactchat-dc00d.appspot.com",
  messagingSenderId: "211724025741",
  appId: "1:211724025741:web:a9ffe60baf7dcf8c1f07c4",
  measurementId: "G-BHB8F2W8W0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
