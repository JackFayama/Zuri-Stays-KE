// PWA Utility Functions

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupOnlineOfflineHandlers();
    this.checkIfInstalled();
    this.setupBeforeInstallPrompt();
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('PWA: Service Worker registered successfully', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });

        return registration;
      } catch (error) {
        console.error('PWA: Service Worker registration failed', error);
      }
    }
  }

  // Setup install prompt
  setupBeforeInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
  }

  // Setup install prompt handling
  setupInstallPrompt() {
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App was installed');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstallSuccess();
    });
  }

  // Check if app is already installed
  checkIfInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('PWA: App is running in standalone mode');
    }

    // Check for iOS Safari standalone mode
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA: App is running in iOS standalone mode');
    }
  }

  // Show install button
  showInstallButton() {
    if (this.isInstalled) return;

    const installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      Install App
    `;
    installButton.className = 'fixed bottom-4 right-4 bg-rose-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-rose-600 transition-colors flex items-center z-50';
    installButton.onclick = () => this.promptInstall();

    document.body.appendChild(installButton);
  }

  // Hide install button
  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  // Prompt user to install
  async promptInstall() {
    if (!this.deferredPrompt) {
      this.showManualInstallInstructions();
      return;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('PWA: User choice:', outcome);
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('PWA: Error prompting install', error);
    }
  }

  // Show manual install instructions
  showManualInstallInstructions() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Install Zuri Stays KE</h3>
          <div class="text-sm text-gray-600 mb-6 text-left">
            <p class="mb-2"><strong>Chrome/Edge:</strong></p>
            <p class="mb-3">• Tap the menu (⋮) → "Add to Home screen"</p>
            <p class="mb-2"><strong>Safari (iOS):</strong></p>
            <p class="mb-3">• Tap Share → "Add to Home Screen"</p>
            <p class="mb-2"><strong>Firefox:</strong></p>
            <p>• Tap the menu (⋮) → "Install"</p>
          </div>
          <button onclick="this.closest('.fixed').remove()" class="w-full bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors">
            Got it
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Show install success message
  showInstallSuccess() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">App Installed!</h3>
          <p class="text-gray-600 mb-6">Zuri Stays KE has been installed successfully. You can now access it from your home screen.</p>
          <button onclick="this.closest('.fixed').remove()" class="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
            Great!
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 3000);
  }

  // Show update available notification
  showUpdateAvailable() {
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span class="text-sm">Update available</span>
        </div>
        <button onclick="this.closest('#pwa-update-notification').remove()" class="ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <button onclick="window.location.reload()" class="mt-2 w-full bg-white text-blue-500 py-1 px-3 rounded text-sm hover:bg-gray-100 transition-colors">
        Update Now
      </button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  // Setup online/offline handlers
  setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showOnlineStatus();
      console.log('PWA: App is online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineStatus();
      console.log('PWA: App is offline');
    });
  }

  // Show online status
  showOnlineStatus() {
    this.removeOfflineIndicator();
    const indicator = document.createElement('div');
    indicator.id = 'pwa-online-indicator';
    indicator.className = 'fixed top-4 left-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-sm';
    indicator.innerHTML = `
      <div class="flex items-center">
        <div class="w-2 h-2 bg-white rounded-full mr-2"></div>
        Back online
      </div>
    `;
    document.body.appendChild(indicator);

    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 3000);
  }

  // Show offline status
  showOfflineStatus() {
    const indicator = document.createElement('div');
    indicator.id = 'pwa-offline-indicator';
    indicator.className = 'fixed top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-sm';
    indicator.innerHTML = `
      <div class="flex items-center">
        <div class="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
        You're offline
      </div>
    `;
    document.body.appendChild(indicator);
  }

  // Remove offline indicator
  removeOfflineIndicator() {
    const indicator = document.getElementById('pwa-offline-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('PWA: Notification permission:', permission);
      return permission === 'granted';
    }
    return false;
  }

  // Show local notification
  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  // Get app info
  getAppInfo() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotifications: 'Notification' in window,
      notificationPermission: 'Notification' in window ? Notification.permission : 'not-supported'
    };
  }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Make it globally available
window.pwaManager = pwaManager;
