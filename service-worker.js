// Service Worker for N&D Co. Tools Portal
const CACHE_NAME = 'nd-tools-v1';
const RUNTIME_CACHE = 'nd-tools-runtime-v1';

// Assets to cache on install
const PRECACHE_URLS = [
    '/tools/',
    '/tools/index.html',
    '/tools/style.css',
    '/tools/script.js',
    '/tools/tools.json',
    '/tools/manifest.json',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js',
    'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.startsWith('https://fonts.googleapis.com') &&
        !event.request.url.startsWith('https://fonts.gstatic.com') &&
        !event.request.url.startsWith('https://cdnjs.cloudflare.com') &&
        !event.request.url.startsWith('https://unpkg.com') &&
        !event.request.url.startsWith('https://cdn.jsdelivr.net')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Clone the request
                return fetch(event.request.clone())
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched response
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/tools/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-tools') {
        event.waitUntil(syncTools());
    }
});

// Sync tools data
async function syncTools() {
    try {
        const response = await fetch('/tools/tools.json');
        const tools = await response.json();
        
        // Update cache with fresh data
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put('/tools/tools.json', new Response(JSON.stringify(tools)));
        
        console.log('[Service Worker] Tools synced successfully');
    } catch (error) {
        console.error('[Service Worker] Failed to sync tools:', error);
    }
}

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New tools available!',
        icon: '/tools/assets/icons/icon-192x192.png',
        badge: '/tools/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'nd-tools-notification',
        requireInteraction: false
    };
    
    event.waitUntil(
        self.registration.showNotification('N&D Co. Tools', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/tools/')
    );
});

// Message event for communication with the app
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});
