import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(app)
export const firebaseGoogleProvider = new GoogleAuthProvider()

// src/stores/auth.ts
import { defineStore } from 'pinia'
import { auth, googleProvider } from '@/config/firebase'
import { signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    initialAuthCheckComplete: false,

    user: null,
    loading: false,
    error: null
  }),

  actions: {
    async loginWithGoogle() {
      this.loading = true
      this.error = null
      
      try {
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        // Stocker les informations de l'utilisateur
        this.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
        return true
      } catch (error) {
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    async login({ email, password }) {
      this.loading = true
      this.error = null
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        this.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
        return true
      } catch (error) {
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
        return true
      } catch (error) {
        this.error = error.message
        return false
      }
    }
  }
})