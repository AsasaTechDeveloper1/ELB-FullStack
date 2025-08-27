// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBO9s3e3BXJXV46iXzyHI9O7wX0i2_iHkw",
  authDomain: "electronic-log-book-2d67f.firebaseapp.com",
  projectId: "electronic-log-book-2d67f",
  storageBucket: "electronic-log-book-2d67f.appspot.com",
  messagingSenderId: "411648420048",
  appId: "1:411648420048:web:6b8571905222572c0616d5",
  measurementId: "G-WVT7JEFE8D",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
