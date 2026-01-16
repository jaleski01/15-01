import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { getFirestore } from 'firebase/firestore';

// Configuração oficial do projeto: desafio-60-15
const firebaseConfig = {
  apiKey: "AIzaSyCOX18n01dJ7XNnwKpk3eZliUJ_ZZ8Uyrw",
  authDomain: "desafio-60-15.firebaseapp.com",
  projectId: "desafio-60-15",
  storageBucket: "desafio-60-15.firebasestorage.app",
  messagingSenderId: "293879220222",
  appId: "1:293879220222:web:942a187a80755381ede2af",
  measurementId: "G-SZJ7DMD9NC"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Services
export const auth = app.auth();
export const db = getFirestore();
export const analytics = app.analytics();