import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDEzZEW8lpVSKcF1c8NW0obbUp2O1I-8sM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "trading-autonomous-agent.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "trading-autonomous-agent",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "trading-autonomous-agent.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "62449793948",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:62449793948:web:63a2710151286477a06659"
};

// Initialize Firebase safely for both SSR and Client
let app: FirebaseApp | undefined = undefined;
let db: Firestore | undefined = undefined;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization notice:', error);
}

export { app, db };
