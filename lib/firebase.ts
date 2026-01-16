import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCOX18n01dJ7XNnwKpk3eZliUJ_ZZ8Uyrw",
  authDomain: "desafio-60-15.firebaseapp.com",
  projectId: "desafio-60-15",
  storageBucket: "desafio-60-15.firebasestorage.app",
  messagingSenderId: "293879220222",
  appId: "1:293879220222:web:942a187a80755381ede2af",
  measurementId: "G-SZJ7DMD9NC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const currentToken = await getToken(messaging, { 
          vapidKey: 'BIfzJbY9Esj4NVlIfbQs9qKU58y0CBAoxfpAGR0AzMXVKG6QygXVzKsxghzp7qYcR0SZuvR3UUZMr-1ifwese8s',
          serviceWorkerRegistration: registration 
        });

        if (currentToken) {
          return currentToken;
        }
      }
    }
  } catch (err) {
    console.log('Erro token:', err);
  }
  return null;
};
