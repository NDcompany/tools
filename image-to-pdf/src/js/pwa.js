// PWA Installation and Service Worker Management
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        // Register service worker
        this.registerServiceWorker();
        
        // Setup install prompt handling
        this.setupInstallPrompt();
        
        // Check if app is already installed
        this.checkInstallStatus();
        
        // Setup update handling
        this.setupUpdateHandling();
    }

    // Register the service worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('✅ Service Worker registered successfully:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateNotification();
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        } else {
            console.log('Service Workers are not supported in this browser.');
        }
    }

    // Setup install prompt handling
    setupInstallPrompt() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('💾 Install prompt available');
            e.preventDefault(); // Prevent the default prompt
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('🎉 App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstalledMessage();
        });
    }

    // Check if app is already installed
    checkInstallStatus() {
        // Check if running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            this.isInstalled = true;
            console.log('📱 App is running in standalone mode');
        }

        // Check for iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS && !window.navigator.standalone) {
            this.showIOSInstallInstructions();
        }
    }

    // Show install button
    showInstallButton() {
        let installButton = document.getElementById('pwa-install-btn');
        
        if (!installButton) {
            // Create install button if it doesn't exist
            installButton = document.createElement('button');
            installButton.id = 'pwa-install-btn';
            installButton.className = 'pwa-install-button';
            installButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Install App
            `;
            
            // Add styles
            installButton.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                background: #22c55e;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                transition: all 0.3s ease;
                font-size: 14px;
            `;
            
            document.body.appendChild(installButton);
            
            // Add hover effects
            installButton.addEventListener('mouseenter', () => {
                installButton.style.transform = 'translateY(-2px)';
                installButton.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
            });
            
            installButton.addEventListener('mouseleave', () => {
                installButton.style.transform = 'translateY(0)';
                installButton.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
            });
        }
        
        installButton.style.display = 'flex';
        installButton.addEventListener('click', () => this.promptInstall());
    }

    // Hide install button
    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-btn');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    // Prompt for installation
    async promptInstall() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`User response to install prompt: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
        } else {
            console.log('❌ User dismissed the install prompt');
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    // Show iOS install instructions
    showIOSInstallInstructions() {
        const isDisplayed = localStorage.getItem('ios-install-shown');
        if (isDisplayed) return;

        const instruction = document.createElement('div');
        instruction.id = 'ios-install-instruction';
        instruction.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 16px;
            border-radius: 12px;
            z-index: 1000;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        instruction.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <strong>Install this app on iOS:</strong>
                <button onclick="this.parentElement.parentElement.remove(); localStorage.setItem('ios-install-shown', 'true');" 
                        style="background: none; border: none; color: #9ca3af; font-size: 18px; cursor: pointer;">&times;</button>
            </div>
            Tap the <strong>Share</strong> button <svg style="display: inline; width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg> then <strong>"Add to Home Screen"</strong>
        `;
        
        document.body.appendChild(instruction);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (instruction.parentElement) {
                instruction.remove();
                localStorage.setItem('ios-install-shown', 'true');
            }
        }, 10000);
    }

    // Show installed message
    showInstalledMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #22c55e;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1001;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        `;
        message.textContent = '🎉 App installed successfully!';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Setup update handling
    setupUpdateHandling() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    // Show update notification
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #3b82f6;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            max-width: 90vw;
        `;
        
        notification.innerHTML = `
            <span>New version available!</span>
            <button onclick="this.updateApp()" style="
                background: white;
                color: #3b82f6;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            ">Update</button>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 4px;
            ">&times;</button>
        `;
        
        // Add update function to the update button
        notification.querySelector('button').addEventListener('click', () => {
            this.updateApp();
        });
        
        document.body.appendChild(notification);
    }

    // Update the app
    updateApp() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration && registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            });
        }
    }

    // Get app info
    getAppInfo() {
        return {
            isInstalled: this.isInstalled,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches,
            canInstall: !!this.deferredPrompt,
            serviceWorkerSupported: 'serviceWorker' in navigator
        };
    }
}

// Initialize PWA Manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaManager = new PWAManager();
    });
} else {
    window.pwaManager = new PWAManager();
}

// Export for use in other scripts
window.PWAManager = PWAManager;
