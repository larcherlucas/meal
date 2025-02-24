// src/utils/router-helpers.js
import router from '@/router'

/**
 * Navigate safely to a new route, handling errors gracefully
 * @param {string} path - The path to navigate to
 * @returns {Promise<boolean>} - Success status of navigation
 */
export const navigateTo = async (path) => {
  try {
    await router.push(path)
    return true
  } catch (err) {
    if (err.name !== 'NavigationDuplicated') {
      console.error('Navigation error:', err)
    }
    return false
  }
}

/**
 * Add a slight delay before navigation to ensure any state updates are complete
 * @param {string} path - The path to navigate to 
 * @param {number} delay - Delay in milliseconds before navigation
 * @returns {Promise<boolean>} - Success status of navigation
 */
export const navigateWithDelay = (path, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await navigateTo(path)
      resolve(result)
    }, delay)
  })
}