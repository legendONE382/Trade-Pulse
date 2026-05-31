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

// PWA install prompt handling
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredPrompt = e
})

window.addEventListener('appinstalled', () => {
  window.deferredPrompt = null
})

window.deferredPrompt = null
window.installPWA = async () => {
  if (!window.deferredPrompt) return
  window.deferredPrompt.prompt()
  await window.deferredPrompt.userChoice
  window.deferredPrompt = null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
