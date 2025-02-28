<!-- components/ui/NotificationContainer.vue -->
<script setup lang="ts">
import { useNotificationStore } from '../../stores/notification';
import NotificationToast from './NotificationToast.vue';

const notificationStore = useNotificationStore();
</script>

<template>
  <div class="fixed top-4 right-4 z-50 w-full max-w-md space-y-2">
    <TransitionGroup name="notification">
      <NotificationToast 
        v-for="notification in notificationStore.notifications" 
        :key="notification.id"
        :notification="notification" 
        :onDismiss="notificationStore.dismissNotification"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active, 
.notification-leave-active {
  transition: all 0.5s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>