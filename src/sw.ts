/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { createHandlerBoundToURL } from 'workbox-precaching';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Fix: Augment self type to include __WB_MANIFEST property injected by VitePWA
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any };

// ---------------------------------------------------------------------------
// 1. Configuração PWA (Workbox - Offline & Caching)
// ---------------------------------------------------------------------------

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// Injeção automática dos assets do Vite (Precache)
precacheAndRoute(self.__WB_MANIFEST);

// Roteamento SPA (Redireciona navegação para index.html para suportar History API offline)
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [
    /^\/_/,               // Exclui rotas internas do servidor
    /\/[^/?]+\.[^/]+$/,   // Exclui arquivos com extensão (imagens, css, etc)
  ],
});
registerRoute(navigationRoute);

// ---------------------------------------------------------------------------
// 2. Configuração Firebase Messaging (Background)
// ---------------------------------------------------------------------------

// Configuração redeclarada explicitamente para evitar problemas de escopo no SW
const firebaseConfig = {
  apiKey: "AIzaSyCOX18n01dJ7XNnwKpk3eZliUJ_ZZ8Uyrw",
  authDomain: "desafio-60-15.firebaseapp.com",
  projectId: "desafio-60-15",
  storageBucket: "desafio-60-15.firebasestorage.app",
  messagingSenderId: "293879220222",
  appId: "1:293879220222:web:942a187a80755381ede2af",
  measurementId: "G-SZJ7DMD9NC"
};

// Inicialização usando Modular SDK (V9+)
// Isso permite que o Vite faça o tree-shaking e bundle correto
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handler para mensagens recebidas quando o app está em Background ou Fechado
onBackgroundMessage(messaging, (payload) => {
  console.log('[Service Worker] Notificação Background recebida:', payload);

  const notificationTitle = payload.notification?.title || 'Nova Mensagem';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png', // Ícone pequeno para a barra de status (Android)
    data: payload.data // Passa dados extras para clique
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listener opcional para cliques na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Foca na janela do app se estiver aberta, ou abre uma nova
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});