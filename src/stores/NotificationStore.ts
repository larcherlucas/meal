import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id?: string;
  type: NotificationType;
  message: string;
  duration?: number; // en millisecondes
  closable?: boolean;
  timestamp?: number;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const MAX_NOTIFICATIONS = 5; // Nombre maximum de notifications à afficher simultanément
  
  // Computed properties
  const activeNotifications = computed(() => 
    notifications.value.slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  );
  
  const notificationsByType = computed(() => {
    const result: Record<NotificationType, Notification[]> = {
      success: [],
      error: [],
      warning: [],
      info: []
    };
    
    notifications.value.forEach(notification => {
      result[notification.type].push(notification);
    });
    
    return result;
  });
  
  /**
   * Génère un ID unique pour une notification
   * @returns Un ID unique
   */
  const generateUniqueId = (): string => {
    return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };
  
  /**
   * Affiche une nouvelle notification
   * @param notification Les détails de la notification à afficher
   * @returns L'ID de la notification créée
   */
  const showNotification = (notification: Notification): string => {
    // Génère un ID unique si non fourni
    const id = notification.id || generateUniqueId();
    const duration = notification.duration !== undefined ? notification.duration : 5000; // Durée par défaut: 5 secondes
    const closable = notification.closable !== undefined ? notification.closable : true;
    const timestamp = Date.now();
    
    // Limite le nombre de notifications simultanées
    if (notifications.value.length >= MAX_NOTIFICATIONS) {
      // Retire la notification la plus ancienne si on atteint la limite
      const oldestNotification = [...notifications.value]
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))[0];
      
      if (oldestNotification && oldestNotification.id) {
        dismissNotification(oldestNotification.id);
      }
    }
    
    // Ajoute la notification à la liste
    notifications.value.push({
      ...notification,
      id,
      duration,
      closable,
      timestamp
    });
    
    // Programme la suppression automatique si une durée est spécifiée et positive
    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }
    
    return id;
  };
  
  /**
   * Supprime une notification spécifique
   * @param id L'ID de la notification à supprimer
   * @returns boolean indiquant si la suppression a réussi
   */
  const dismissNotification = (id: string): boolean => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
      return true;
    }
    return false;
  };
  
  /**
   * Supprime toutes les notifications
   */
  const clearAllNotifications = (): void => {
    notifications.value = [];
  };
  
  /**
   * Supprime toutes les notifications d'un type spécifique
   * @param type Le type de notifications à supprimer
   */
  const clearNotificationsByType = (type: NotificationType): void => {
    notifications.value = notifications.value.filter(n => n.type !== type);
  };
  
  /**
   * Raccourcis pour les types de notification courants
   */
  const success = (message: string, options: Partial<Omit<Notification, 'type' | 'message'>> = {}): string => {
    return showNotification({ type: 'success', message, ...options });
  };
  
  const error = (message: string, options: Partial<Omit<Notification, 'type' | 'message'>> = {}): string => {
    return showNotification({ type: 'error', message, ...options });
  };
  
  const warning = (message: string, options: Partial<Omit<Notification, 'type' | 'message'>> = {}): string => {
    return showNotification({ type: 'warning', message, ...options });
  };
  
  const info = (message: string, options: Partial<Omit<Notification, 'type' | 'message'>> = {}): string => {
    return showNotification({ type: 'info', message, ...options });
  };

  return {
    // États
    notifications,
    
    // Propriétés calculées
    activeNotifications,
    notificationsByType,
    
    // Actions
    show: showNotification,
    dismissNotification,
    clearAllNotifications,
    clearNotificationsByType,
    success,
    error,
    warning,
    info
  };
});