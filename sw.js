/* sw.js – Ergo Quiz PWA (offline-first) */

const VERSION = 'v1.5.0'; // 👈 Version incrémentée
const PRECACHE = `ergo-precache-${VERSION}`;
const RUNTIME  = `ergo-runtime-${VERSION}`;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/js/app.js',
  '/assets/libjs/mermaid.esm.min.mjs',
  '/js/features-view/view-themes.js',
  '/js/features-view/view-dashboard.js',
  '/js/features-view/view-quiz.js',
  '/js/features-view/view-results.js',
  '/js/features-view/view-flashcards.js',
  '/js/features-view/view-revision.js',
  '/js/features-view/view-history.js',
  '/js/features-view/view-import-theme.js',
  '/js/features-view/view-custom-themes.js',
  '/js/features-view/view-pdf-import.js',
  '/js/features-view/view-about.js',
  '/js/features/features-custom-themes.js',
  '/js/features/features-dashboard.js',
  '/js/features/features-export.js',
  '/js/features/features-flashcards.js',
  '/js/features/features-quiz.js',
  '/js/features/features-theme-import.js',
  '/js/features/features-theme-validator.js',
  '/data/theme-main.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/manifest.webmanifest'
];

const FALLBACK_JSON = new Response(JSON.stringify({
  error: 'offline_unavailable',
  message: 'Ressource indisponible hors ligne.',
  questions: []
}), { headers: { 'Content-Type': 'application/json' } });

// ============================================
// INSTALLATION
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] 🔧 Installation v' + VERSION);
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(PRECACHE);
      
      const results = await Promise.allSettled(
        CORE_ASSETS.map(asset => 
          fetch(asset).then(resp => {
            if (!resp.ok) throw new Error(`${asset}: ${resp.status}`);
            return cache.put(asset, resp);
          })
        )
      );
      
      const failed = results.filter((r, i) => {
        if (r.status === 'rejected') {
          console.warn(`[SW] ⚠️ Échec précache: ${CORE_ASSETS[i]}`);
          return true;
        }
        return false;
      });
      
      if (failed.length === 0) {
        console.log('[SW] ✅ Tous les assets précachés');
      } else {
        console.log(`[SW] ⚠️ ${failed.length} fichier(s) non trouvé(s)`);
      }
      
      self.skipWaiting();
    } catch (err) {
      console.error('[SW] ❌ Erreur installation:', err);
    }
  })());
});

// ============================================
// ACTIVATION
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] 🚀 Activation v' + VERSION);
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k.startsWith('ergo-') && k !== PRECACHE && k !== RUNTIME)
        .map(k => {
          console.log(`[SW] 🗑️ Suppression: ${k}`);
          return caches.delete(k);
        })
    );
    self.clients.claim();
    console.log('[SW] ✅ Service Worker activé et prêt');
  })());
});

// ============================================
// FETCH - Gestion des requêtes
// ============================================
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // JSON files -> Cache avec fallback
  if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(staleWhileRevalidateWithFallback(req));
    return;
  }

  // Core assets -> Cache first
  if (isCoreAsset(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Reste -> Network first
  event.respondWith(networkFirst(req));
});

// ============================================
// HELPERS
// ============================================
function isCoreAsset(pathname) {
  return CORE_ASSETS.some(asset => pathname === asset || pathname.endsWith(asset));
}

async function cacheFirst(request) {
  const cache = await caches.open(PRECACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] 📦 Cache:', request.url);
    return cached;
  }
  
  try {
    const resp = await fetch(request);
    if (resp && resp.ok) {
      cache.put(request, resp.clone());
      console.log('[SW] 🌐 Fetch + cache:', request.url);
    }
    return resp;
  } catch (e) {
    console.error('[SW] ❌ Offline:', request.url);
    if (request.destination === 'document') {
      const fallback = await cache.match('/index.html');
      return fallback || new Response('Offline', { status: 503 });
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  const runtime = await caches.open(RUNTIME);
  
  try {
    const resp = await fetch(request);
    if (resp && resp.ok) {
      runtime.put(request, resp.clone());
    }
    return resp;
  } catch (e) {
    const cached = await runtime.match(request);
    if (cached) {
      console.log('[SW] 📦 Runtime cache:', request.url);
      return cached;
    }
    
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidateWithFallback(request) {
  const runtime = await caches.open(RUNTIME);
  const cached = await runtime.match(request);
  
  // Fetch en arrière-plan
  const netFetch = fetch(request).then(resp => {
    if (resp && resp.ok) {
      console.log('[SW] 🔄 Update cache:', request.url);
      runtime.put(request, resp.clone());
    }
    return resp;
  }).catch(() => null);
  
  // Si cache dispo, retour immédiat
  if (cached) {
    console.log('[SW] ⚡ Cache (revalidating):', request.url);
    return cached;
  }
  
  // Sinon attendre réseau
  const resp = await netFetch;
  
  // Si pas de réseau ET pas de cache
  if (!resp) {
    console.warn('[SW] ❌ Offline unavailable:', request.url);
    return FALLBACK_JSON;
  }
  
  return resp;
}