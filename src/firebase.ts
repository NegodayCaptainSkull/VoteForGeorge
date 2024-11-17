import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDHWa8wMR2oXJkI5C8IxYLI8Z050ZKJT-M",
  authDomain: "vote-for-george.firebaseapp.com",
  databaseURL: "https://vote-for-george-default-rtdb.firebaseio.com",
  projectId: "vote-for-george",
  storageBucket: "vote-for-george.firebasestorage.app",
  messagingSenderId: "284314274130",
  appId: "1:284314274130:web:da18f438da4b09b9df528b"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
