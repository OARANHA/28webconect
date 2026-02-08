/**
 * Service Worker para Web Push Notifications
 * 28Web Connect
 */

// Evento de instalação
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

// Evento de ativação
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Evento de push notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);

  let payload;
  try {
    payload = event.data?.json() || {};
  } catch (error) {
    payload = { title: 'Nova notificação', message: event.data?.text() || '' };
  }

  const { title, message, icon, badge, data } = payload;

  const options = {
    body: message || '',
    icon: icon || '/assets/28connect.jpg',
    badge: badge || '/assets/28connect.jpg',
    tag: data?.type || 'notification',
    data: data || {},
    requireInteraction: false,
    actions: data?.actions || [],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(title || '28Web Connect', options)
  );
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);

  event.notification.close();

  const notificationData = event.notification.data;
  const urlToOpen = notificationData?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Tentar focar janela existente
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // Abrir nova janela se não houver uma existente
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Evento de fechamento da notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada:', event);
});

// Evento de mensagem (para comunicação com o app)
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);

  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
