/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { createHandlerBoundToURL } from 'workbox-precaching';
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

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
// 2. Configuração Firebase Messaging (Background) - MODULAR SDK
// ---------------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCOX18n01dJ7XNnwKpk3eZliUJ_ZZ8Uyrw",
  authDomain: "desafio-60-15.firebaseapp.com",
  projectId: "desafio-60-15",
  storageBucket: "desafio-60-15.firebasestorage.app",
  messagingSenderId: "293879220222",
  appId: "1:293879220222:web:942a187a80755381ede2af",
  measurementId: "G-SZJ7DMD9NC"
};

// Inicialização Modular para o Service Worker
// Usamos a importação principal 'firebase/messaging' pois a SDK detecta o ambiente SW
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Nota: Removemos 'onBackgroundMessage' para evitar erros de tipagem/importação.
// O Firebase SW SDK lida automaticamente com a exibição de notificações se o payload contiver a chave 'notification'.
