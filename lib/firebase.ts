import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import 'firebase/compat/messaging';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCOX18n01dJ7XNnwKpk3eZliUJ_ZZ8Uyrw",
  authDomain: "desafio-60-15.firebaseapp.com",
  projectId: "desafio-60-15",
  storageBucket: "desafio-60-15.firebasestorage.app",
  messagingSenderId: "293879220222",
  appId: "1:293879220222:web:942a187a80755381ede2af",
  measurementId: "G-SZJ7DMD9NC"
};

const app = firebase.initializeApp(firebaseConfig);

export const auth = app.auth();
export const db = getFirestore();
export const analytics = app.analytics();
export const messaging = firebase.messaging();

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await messaging.getToken({ 
        vapidKey: 'BIfzJbY9Esj4NVlIfbQs9qKU58y0CBAoxfpAGR0AzMXVKG6QygXVzKsxghzp7qYcR0SZuvR3UUZMr-1ifwese8s' 
      });
      if (currentToken) {
        console.log('Token FCM obtido:', currentToken);
        return currentToken;
      } else {
        console.log('Nenhum token de registro disponível.');
      }
    } else {
      console.log('Permissão de notificação negada.');
    }
  } catch (err) {
    console.log('Um erro ocorreu ao recuperar o token.', err);
  }
  return null;
};