// Service Worker Registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  if (confirm('New version available! Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// PWA Install Prompt
let deferredPrompt: any = null;

export const initPWAInstallPrompt = () => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or banner (you can customize this)
    showInstallBanner();
  });

  // Listen for the app being installed
  window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
    hideInstallBanner();
  });
};

export const showInstallBanner = () => {
  // Create install banner
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 90vw;
  `;
  
  banner.innerHTML = `
    <span>📱 Install Oripio Medico for quick access!</span>
    <button id="pwa-install-btn" style="
      background: white;
      color: #28a745;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    ">Install</button>
    <button id="pwa-dismiss-btn" style="
      background: transparent;
      color: white;
      border: none;
      padding: 6px;
      cursor: pointer;
      font-size: 16px;
    ">✕</button>
  `;
  
  document.body.appendChild(banner);
  
  // Add install button click handler
  document.getElementById('pwa-install-btn')?.addEventListener('click', installPWA);
  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', hideInstallBanner);
};

export const hideInstallBanner = () => {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.remove();
  }
};

export const installPWA = async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    // Hide the install banner
    hideInstallBanner();
  }
};

// Network Status Detection
export const initNetworkStatusDetection = () => {
  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline', !isOnline);
    
    if (!isOnline) {
      showOfflineNotification();
    } else {
      hideOfflineNotification();
    }
  };

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  // Initial check
  updateNetworkStatus();
};

const showOfflineNotification = () => {
  let notification = document.getElementById('offline-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff6b6b;
      color: white;
      text-align: center;
      padding: 10px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
    `;
    notification.textContent = '📵 You are offline. Some features may not be available.';
    document.body.appendChild(notification);
  }
};

const hideOfflineNotification = () => {
  const notification = document.getElementById('offline-notification');
  if (notification) {
    notification.remove();
  }
};