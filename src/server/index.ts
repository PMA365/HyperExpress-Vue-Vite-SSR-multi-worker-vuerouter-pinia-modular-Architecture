import fs from 'node:fs/promises';
import HyperExpress from 'hyper-express';
import LiveDirectory from 'live-directory';
import type { ViteDevServer } from 'vite';
import { onExit } from 'signal-exit';

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT ? Number(process.env.PORT) : 5173;
const base = process.env.BASE || '/';

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : '';

// Create http server
const app = new HyperExpress.Server({
  // Autoclose doesn't work properly (at least with development server) -> close in clean exit handler.
  auto_close: false,
});

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */

let vite: ViteDevServer;
let LiveAssets: LiveDirectory;

if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares as any);
} else {
  const { createLiveDirectory, staticMiddleware } = await import(
    './serve-static.js'
  );
  LiveAssets = createLiveDirectory('./dist/client');
  app.use(staticMiddleware(LiveAssets));
}

// Serve HTML
app.get('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');

    /** @type {string} */
    let template;
    /** @type {import('./src/entry-server.ts').render} */
    let render;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/client/entry-server.ts')).render;
    } else {
      template = templateHtml;
      render = (await import('../../dist/server/entry-server.js' as any))
        .render;
    }

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '');

    res.status(200);
    res.header('content-type', 'text/html');
    res.send(html);
  } catch (e: unknown) {
    const err = e as Error;
    vite?.ssrFixStacktrace(err);
    console.log(err.stack);
    res.status(500).end(err.stack);
  }
});

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

// Exit handler
const unload = onExit(
  (
    _code: number | null | undefined,
    signal: NodeJS.Signals | null
  ): true | void => {
    console.log('\nExit with signal', signal);

    if (LiveAssets) {
      // Typo remains in the npm package, but corrected on GitHub.
      LiveAssets.destory();
    }

    const exited = app.close();

    if (exited) {
      console.log('Server was closed.');
    } else {
      console.warn('There was a problem while closing server.');
    }

    unload();

    return exited || undefined;
  },
  { alwaysLast: true }
);
