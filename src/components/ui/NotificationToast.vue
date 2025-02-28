<!-- components/ui/NotificationToast.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { XCircle, CheckCircle, AlertCircle, Info } from 'lucide-vue-next';
import type { Notification } from '../../stores/notification';

interface Props {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const props = defineProps<Props>();

// Apparence selon le type de notification
const appearance = computed(() => {
  switch (props.notification.type) {
    case 'success': 
      return {
        bgColor: 'bg-spice-green/10',
        borderColor: 'border-spice-green',
        textColor: 'text-spice-green',
        icon: CheckCircle
      };
    case 'error':
      return {
        bgColor: 'bg-spice-red/10', 
        borderColor: 'border-spice-red',
        textColor: 'text-spice-red',
        icon: XCircle
      };
    case 'warning':
      return {
        bgColor: 'bg-spice-yellow/10',
        borderColor: 'border-spice-yellow',
        textColor: 'text-spice-yellow',
        icon: AlertCircle
      };
    case 'info':
    default:
      return {
        bgColor: 'bg-spice-blue/10',
        borderColor: 'border-spice-blue',
        textColor: 'text-spice-blue',
        icon: Info
      };
  }
});
</script>

<template>
  <div 
    class="rounded-lg shadow-bento p-4 mb-3 border-l-4 w-full max-w-md animate-slide-in transform transition-all duration-500 ease-bounce-soft"
    :class="[appearance.bgColor, appearance.borderColor]"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0 mr-3">
        <component :is="appearance.icon" :class="appearance.textColor" size="20" />
      </div>
      <div class="flex-grow">
        <p class="text-sm font-medium" :class="appearance.textColor">
          {{ notification.message }}
        </p>
      </div>
      <div v-if="notification.closable" class="flex-shrink-0 ml-2">
        <button 
          type="button"
          class="text-gray-400 hover:text-gray-600 transition-colors duration-300"
          @click="onDismiss(notification.id as string)"
        >
          <XCircle size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-in {
  animation: slide-in 0.5s ease-out forwards;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>