// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {

  apiKey: "AIzaSyB8oA66-xZNmTIH-oRj9FRlLSegn_LmElM",

  authDomain: "curro-chat-app.firebaseapp.com",

  projectId: "curro-chat-app",

  storageBucket: "curro-chat-app.firebasestorage.app",

  messagingSenderId: "41530793050",

  appId: "1:41530793050:web:b751bbc52b8a6f63898c63"

};


const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;