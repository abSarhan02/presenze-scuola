import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6XQJ-dki6ZFp5XZ-2xdmTXOcgCDo9YnQ",
  authDomain: "presenze-scuola-af265.firebaseapp.com",
  projectId: "presenze-scuola-af265",
  storageBucket: "presenze-scuola-af265.firebasestorage.app",
  messagingSenderId: "827792952584",
  appId: "1:827792952584:web:f73726cb9f9a74a33ef0bd",
};

export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
