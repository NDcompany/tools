const CACHE_NAME = 'invoice-generator-v1.0.0';
const urlsToCache = [
    './',
    './index.html',
    './offline.html',
    './src/css/style.css',
    './src/js/script.js',
    './src/js/pwa.js',
    './src/favicons/favicon-196x196.png',
    './src/favicons/mstile-310x310.png',
    './src/favicons/favicon-32x32.png',
    './src/favicons/favicon-96x96.png',
    './src/media/sparkle-green.svg',
    './src/media/sparkle-red.svg',
    // Add Google Fonts if used
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    // Add any other external resources
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[SW] Failed to cache:', error);
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('invoice-generator-')) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Ensure the service worker takes control of all pages
    event.waitUntil(clients.claim());
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle different request types
    if (event.request.destination === 'document') {
        // For navigation requests, try network first, then cache
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If we got a response, clone it and put it in cache
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(event.request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            // If not in cache, return offline page
                            return caches.match('./offline.html');
                        });
                })
        );
    } else {
        // For other requests, try cache first, then network
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        // Found in cache
                        return response;
                    }
                    
                    // Not in cache, fetch from network
                    return fetch(event.request)
                        .then(response => {
                            // Don't cache if not a valid response
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }

                            // Clone the response
                            const responseToCache = response.clone();

                            // Add to cache
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        })
                        .catch(error => {
                            console.log('[SW] Fetch failed:', error);
                            // Return a fallback response for failed requests
                            if (event.request.destination === 'image') {
                                return new Response('', {
                                    status: 200,
                                    headers: { 'Content-Type': 'text/plain' }
                                });
                            }
                        });
                })
        );
    }
});

// Handle messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            default:
                console.log('[SW] Unknown message:', event.data);
        }
    }
});

// Background sync for offline functionality (if supported)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('[SW] Background sync triggered');
        // Handle background sync logic here
    }
});

// Push notification handling (if needed in future)
self.addEventListener('push', event => {
    console.log('[SW] Push event received');
    // Handle push notifications here
});
