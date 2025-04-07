pnpm install -g jsdoc

then
pnpm add --save-dev jsdoc

https://github.com/benoitlahoz/hyper-express-vite-vue

# Vue 3 + HyperExpress + Vite SSR

[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/) [![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE) [![PR Welcome Badge](https://badgen.net/https/pr-welcome-badge.vercel.app/api/badge/sinchang/pr-welcome-badge)](https://github.com/benoitlahoz/hyper-express-vite-vue/issues?q=archived:false+is:issue+is:open+sort:updated-desc+label%3A%22help%20wanted%22%2C%22good%20first%20issue%22)

This **experimental** template introduces a way to use [HyperExpress](https://github.com/kartikk221/hyper-express) as server and [LiveDirectory](https://github.com/kartikk221/live-directory) to serve static files, in a server-side rendered site.

It is based on [create-vite-extra](https://github.com/bluwy/create-vite-extra/tree/master) template [template-ssr-vue-ts](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue-ts). It might be useful to look at the difference between the two implementations.

## Motivation

HyperExpress is a high performance webserver.

It may not be noticeable by strictly using this template to serve SSR in small websites, but if one would need to add an API, stream large files, etc., with the power of [uWebsockets.js](https://github.com/uNetworking/uWebSockets.js) under the hood, it will definitely make the difference.

And if one needs to use WebSockets but prefers working with the [socket.io](https://socket.io/) API, [socket.io provide a very simple way](https://socket.io/docs/v4/server-api/#serverattachappapp-options) to use the underlying HyperExpress `uws` object.

### Warning

One main problem that was preventing the use of HyperExpress for Server-Side Rendering with Vite was an incompatibility between HyperExpress request and response objects and Vite middlewares used in development.

Before writing a polyfill for each of these middlewares, this was resolved by adding some compatible methods on HyperExpress Request and Response objects (see PR [#324](https://github.com/kartikk221/hyper-express/pull/327#issue-2722812184)).

Hopefully this PR will be merged soon.
In the meantime, this package has our own fork of HyperExpress as dependency, but it's obviously exprimental, as it has not been extensively tested. It works, but... **USE AT YOUR OWN RISKS**...

## Installation

```sh
git clone https://github.com/benoitlahoz/hyper-express-vite-vue.git
cd hyper-express-vite-vue
yarn
```

## License

[MIT](./LICENSE)

---

import fs from "node:fs/promises";
import { parentPort } from "worker_threads";
import { renderToString as \_renderToString } from "vue/server-renderer";
import { createSSRApp } from "vue";

// Configuration
const isProduction = process.env.NODE_ENV === "production";
const MAX_REQUESTS_PER_WORKER = 100;
const MEMORY_CHECK_INTERVAL = 30000; // 30 seconds
const MEMORY_THRESHOLD_MB = 1024; // 1GB
const CACHE_CLEANUP_INTERVAL = 60000; // 1 minute
const MAX_CACHE_SIZE = 100;

// Global state
let vite;
let template;
let requestCount = 0;
let globalAppComponent = null;
let globalCreateRouter = null;

// Cache structures
const moduleCache = new Map();
const renderCache = new Map();
const templateCache = new Map();

/\*\*

- Initialize Vite server for SSR
  \*/
  async function initVite() {
  try {
  const { createServer } = await import("vite");
  const base = process.env.BASE || "/";

      vite = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
        base,
        optimizeDeps: {
          include: ["vue", "vue-router", "@vueuse/core"],
          esbuildOptions: { target: "esnext" }
        },
        build: {
          target: "esnext",
          minify: "esbuild",
          rollupOptions: {
            output: {
              manualChunks: { "vue-vendor": ["vue", "vue-router"] }
            }
          }
        },
        ssr: { noExternal: ["vue-router"] }
      });

      // Preload template
      await loadTemplate();

      // Preload global components
      await preloadGlobalComponents();

      return vite;

  } catch (error) {
  console.error("Failed to initialize Vite:", error);
  throw error;
  }
  }

/\*\*

- Load HTML template based on environment
  \*/
  async function loadTemplate() {
  try {
  if (!isProduction) {
  template = await fs.readFile("./index.html", "utf-8");
  } else {
  template = await fs.readFile("./dist/client/index.html", "utf-8");
  }
  console.log("Template loaded successfully");
  } catch (error) {
  console.error("Failed to load template:", error);
  throw error;
  }
  }

/\*\*

- Preload global components to avoid repeated loading
  \*/
  async function preloadGlobalComponents() {
  try {
  const { default: App } = await getComponent("/src/client/App.vue");
  const { createRouter } = await getComponent("/src/client/router/router.js");
  globalAppComponent = App;
  globalCreateRouter = createRouter;

      console.log("Global components preloaded successfully");

  } catch (error) {
  console.error("Failed to preload global components:", error);
  }
  }

/\*\*

- Get component with caching
- @param {string} path - Component path
  \*/
  async function getComponent(path) {
  if (moduleCache.has(path)) {
  return moduleCache.get(path);
  }

try {
const module = await vite.ssrLoadModule(path);
moduleCache.set(path, module);
return module;
} catch (error) {
console.error(`Failed to load component ${path}:`, error);
throw error;
}
}

/\*\*

- Render Vue application to HTML
- @param {string} url - URL to render
  \*/
  async function render(url) {
  // Use cached components if available
  const App = globalAppComponent || (await getComponent("/src/client/App.vue")).default;
  const createRouter = globalCreateRouter || (await getComponent("/src/client/router/router.js")).createRouter;

// Create fresh app instance for each render to avoid state leaks
const app = createSSRApp(App);
const router = createRouter();
app.use(router);

try {
// Wait for router to be ready
await Promise.all([router.push(url), router.isReady()]);

    // Render to string
    const ctx = {};
    const html = await _renderToString(app, ctx);

    // Help garbage collection
    app._container = null;

    return { html, head: '' };

} catch (error) {
console.error(`Error rendering ${url}:`, error);
throw error;
}
}

/\*\*

- Render HTML for a URL
- @param {string} url - URL to render
  \*/
  async function renderHtml(url) {
  // Check cache
  const cacheKey = `${url}-${isProduction}`;
  const cachedItem = renderCache.get(cacheKey);

// Use cache if valid
if (cachedItem && Date.now() - cachedItem.timestamp < 10000) {
return cachedItem.html;
}

try {
// Transform template in development mode
let currentTemplate = template;
if (!isProduction && vite) {
currentTemplate = await vite.transformIndexHtml(url, template);
}

    // Render Vue app
    const rendered = await render(url);

    // Create final HTML
    const html = currentTemplate
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    // Cache result
    renderCache.set(cacheKey, {
      html,
      timestamp: Date.now()
    });

    return html;

} catch (error) {
console.error("Render HTML error:", error);
throw error;
}
}

/\*\*

- Clean up caches to prevent memory leaks
  \*/
  function cleanupCaches() {
  // Limit render cache size
  if (renderCache.size > MAX_CACHE_SIZE) {
  const keysToDelete = Array.from(renderCache.keys())
  .sort((a, b) => renderCache.get(a).timestamp - renderCache.get(b).timestamp)
  .slice(0, Math.floor(renderCache.size / 2));
  keysToDelete.forEach(key => renderCache.delete(key));
  console.log(`Cleaned up ${keysToDelete.length} render cache entries`);
  }

// Force garbage collection hint (not guaranteed)
if (global.gc) {
global.gc();
}
}

/\*\*

- Monitor memory usage
  \*/
  function setupMemoryMonitoring() {
  setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
  console.log(`Memory usage: ${heapUsedMB.toFixed(2)} MB`);

      if (heapUsedMB > MEMORY_THRESHOLD_MB) {
        console.warn("Worker memory threshold exceeded, notifying main thread");
        parentPort.postMessage({ type: "memory_warning", memoryUsage: heapUsedMB });

        // Clean up caches to free memory
        cleanupCaches();
      }

  }, MEMORY_CHECK_INTERVAL);
  }

/\*\*

- Setup periodic cache cleanup
  \*/
  function setupCacheCleanup() {
  setInterval(cleanupCaches, CACHE_CLEANUP_INTERVAL);
  }

/\*\*

- Handle messages from main thread
  \*/
  function setupMessageHandler() {
  parentPort.on("message", async (data) => {
  requestCount++;
  // Check if worker should be recycled
  if (requestCount >= MAX_REQUESTS_PER_WORKER) {
  parentPort.postMessage({
  type: "recycle_worker",
  message: "Worker reached maximum request count"
  });
  }

      const { type, url, requestId } = data;

      if (type === "render") {
        try {
          const html = await renderHtml(url);
          parentPort.postMessage({
            type: "rendered",
            html,
            requestId
          });
        } catch (err) {
          console.error(`Render error for ${url}:`, err);
          parentPort.postMessage({
            type: "error",
            message: err.message,
            stack: err.stack,
            requestId
          });
        }
      }

  });
  }

/\*\*

- Initialize worker
  \*/
  async function initWorker() {
  try {
  await initVite();
  setupMemoryMonitoring();
  setupCacheCleanup();
  setupMessageHandler();
  console.log("Worker initialized successfully");
  } catch (error) {
  console.error("Worker initialization failed:", error);
  parentPort.postMessage({
  type: "init_error",
  message: error.message,
  stack: error.stack
  });
  }
  }

// Start worker initialization
initWorker();

/////////////////////////////////////
you should add this line to your tsconfig.json
to solve the cannot import pinia problem
The "resolvePackageJsonExports": false option tells the TypeScript compiler to not resolve package.json exports.
This can help resolve issues with dependencies that have incorrect or missing exports in their package.json files

```bash
"compilerOptions": {
  "resolvePackageJsonExports": false,

}
```
