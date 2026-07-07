import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
function createFirebaseApp() {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    return initializeApp(firebaseConfig);
}
let app;
let auth;
let db;
export function getFirebaseApp() {
    if (!app) {
        app = createFirebaseApp();
    }
    return app;
}
export function getFirebaseAuth() {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}
export function getFirebaseDb() {
    if (!db) {
        db = getFirestore(getFirebaseApp());
    }
    return db;
}
export function isFirebaseConfigured() {
    return Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}
