'use client';

import { PushSubscriptionData } from '@/types/notifications';

// URL base do VAPID public key
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Verifica se o navegador suporta push notifications
 */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Verifica se a permissão de notificação foi concedida
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Converte base64 string para Uint8Array
 * Necessário para applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Registra o service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker não suportado');
      return null;
    }

    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[Push] Service Worker registrado:', registration);
    return registration;
  } catch (error) {
    console.error('[Push] Erro ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Assina o usuário para push notifications
 */
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  try {
    // Verificar suporte
    if (!isPushSupported()) {
      throw new Error('Push notifications não suportado neste navegador');
    }

    // Verificar VAPID key
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID_PUBLIC_KEY não configurada');
    }

    // Solicitar permissão
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão de notificação negada');
    }

    // Registrar service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Não foi possível registrar o Service Worker');
    }

    // Aguardar service worker estar pronto
    await navigator.serviceWorker.ready;

    // Verificar subscription existente
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('[Push] Subscription já existe');
      return pushSubscriptionToData(existingSubscription);
    }

    // Criar nova subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('[Push] Nova subscription criada:', subscription);
    return pushSubscriptionToData(subscription);
  } catch (error) {
    console.error('[Push] Erro ao assinar push:', error);
    throw error;
  }
}

/**
 * Cancela a subscription de push
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const unsubscribed = await subscription.unsubscribe();
      console.log('[Push] Subscription cancelada:', unsubscribed);
      return unsubscribed;
    }

    return false;
  } catch (error) {
    console.error('[Push] Erro ao cancelar subscription:', error);
    return false;
  }
}

/**
 * Verifica se o usuário já está inscrito em push notifications
 */
export async function isSubscribedToPush(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('[Push] Erro ao verificar subscription:', error);
    return false;
  }
}

/**
 * Converte PushSubscription para nosso formato de dados
 */
function pushSubscriptionToData(subscription: PushSubscription): PushSubscriptionData {
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh || '',
      auth: json.keys?.auth || '',
    },
  };
}

/**
 * Mostra uma notificação local (para testes)
 */
export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('Notificações não permitidas');
    return;
  }

  new Notification(title, {
    icon: '/assets/28connect.jpg',
    badge: '/assets/28connect.jpg',
    ...options,
  });
}
