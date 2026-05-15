// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCEdGGdttI6m3e5Fl61HBl8n6HpcGjT4Hk",
  authDomain: "chathorarios.firebaseapp.com",
  databaseURL:
    "https://chathorarios-default-rtdb.firebaseio.com",
  projectId: "chathorarios",
  storageBucket: "chathorarios.appspot.com",
  messagingSenderId: "365124256259",
  appId: "1:365124256259:web:ffa70861acdce20fc58436",
};

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;