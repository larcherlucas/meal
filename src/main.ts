import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialiser les plugins et configurer l'application
import './plugins/auth'  // Plugin d'authentification global

app.mount('#app')