import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Browser compatibility polyfills
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback
      this.elements = new Map()
    }
    observe(element) {
      this.elements.set(element, { width: element.offsetWidth, height: element.offsetHeight })
    }
    unobserve(element) {
      this.elements.delete(element)
    }
    disconnect() {
      this.elements.clear()
    }
  }
}

// PWA Install Prompt Logic
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  window.deferredPrompt = e
  window.updatePWAInstallButton()
  console.log('PWA install prompt detected')
})

window.addEventListener('appinstalled', () => {
  // Hide the install button
  window.deferredPrompt = null
  window.updatePWAInstallButton()
  console.log('PWA installed successfully')
})

// Make the deferred install prompt globally available
window.deferredPrompt = null
window.updatePWAInstallButton = () => {
  const installBtn = document.getElementById('pwa-install-btn')
  if (!installBtn) return
  if (window.deferredPrompt) {
    installBtn.style.display = 'flex'
    installBtn.classList.remove('hidden')
  } else {
    installBtn.style.display = 'none'
  }
}

// Expose the install function globally
window.installPWA = async () => {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt()
    const { outcome } = await window.deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    window.deferredPrompt = null
    window.updatePWAInstallButton()
  } else {
    console.log('No install prompt available. Make sure you are on HTTPS and the app is installable.')
  }
}

// Show install button in development for testing
if (import.meta.env.DEV) {
  setTimeout(() => {
    const installBtn = document.getElementById('pwa-install-btn')
    if (installBtn) {
      installBtn.style.display = 'flex'
      installBtn.classList.remove('hidden')
      console.log('Install button shown for development testing')
    }
  }, 1000)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
