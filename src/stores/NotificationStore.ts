import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // en millisecondes
  closable?: boolean;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  
  /**
   * Affiche une nouvelle notification
   * @param notification Les détails de la notification à afficher
   * @returns L'ID de la notification créée
   */
  const showNotification = (notification: Notification): string => {
    // Génère un ID unique si non fourni
    const id = notification.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = notification.duration || 5000; // Durée par défaut: 5 secondes
    const closable = notification.closable !== undefined ? notification.closable : true;
    
    // Ajoute la notification à la liste
    notifications.value.push({
      ...notification,
      id,
      duration,
      closable
    });
    
    // Programme la suppression automatique si une durée est spécifiée
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
   */
  const dismissNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };
  
  /**
   * Supprime toutes les notifications
   */
  const clearAllNotifications = (): void => {
    notifications.value = [];
  };
  
  /**
   * Raccourcis pour les types de notification courants
   */
  const success = (message: string, options: Partial<Notification> = {}): string => {
    return showNotification({ type: 'success', message, ...options });
  };
  
  const error = (message: string, options: Partial<Notification> = {}): string => {
    return showNotification({ type: 'error', message, ...options });
  };
  
  const warning = (message: string, options: Partial<Notification> = {}): string => {
    return showNotification({ type: 'warning', message, ...options });
  };
  
  const info = (message: string, options: Partial<Notification> = {}): string => {
    return showNotification({ type: 'info', message, ...options });
  };

  return {
    notifications,
    showNotification,
    dismissNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info
  };
});