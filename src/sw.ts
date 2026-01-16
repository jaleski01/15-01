/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { createHandlerBoundToURL } from 'workbox-precaching'

// Fix: Augment self type to include __WB_MANIFEST property injected by VitePWA
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any }

// 1. Configuração PWA (Offline)
self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()

// Injeção automática dos assets do Vite
precacheAndRoute(self.__WB_MANIFEST)

// Roteamento SPA (Redireciona navegação para index.html)
const handler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(handler, {
  denylist: [
    /^\/_/,
    /\/[^/?]+\.[^/]+$/,
  ],
})
registerRoute(navigationRoute)

// 2. Configuração Firebase Messaging (Background)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCOX18n01dJ7XNnwKpk3eZliUJ_ZZ8Uyrw",
  authDomain: "desafio-60-15.firebaseapp.com",
  projectId: "desafio-60-15",
  storageBucket: "desafio-60-15.firebasestorage.app",
  messagingSenderId: "293879220222",
  appId: "1:293879220222:web:942a187a80755381ede2af",
  measurementId: "G-SZJ7DMD9NC"
};

// @ts-ignore
firebase.initializeApp(firebaseConfig);
// @ts-ignore
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload: any) {
  console.log('Notificação Background:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});