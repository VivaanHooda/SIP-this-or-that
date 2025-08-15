// spectator-app/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQVVPvAT6FKzMCoXXNw_uNh92ImzMX2TU",
  authDomain: "debate-game-2df25.firebaseapp.com",
  projectId: "debate-game-2df25",
  storageBucket: "debate-game-2df25.firebasestorage.app",
  messagingSenderId: "11294239589",
  appId: "1:11294239589:web:3712dfe95dc4d433198f8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Functions
export const functions = getFunctions(app);

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators locally
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;
