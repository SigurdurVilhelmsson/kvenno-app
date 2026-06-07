/**
 * Preview server for Playwright E2E tests.
 *
 * Mirrors the per-SPA fallback rules from server/nginx-site.conf so that
 * sub-SPAs (íslenskubraut, lab-reports) and game HTML files are served
 * from their own bundles rather than the landing SPA's index.html.
 *
 * Plain `serve -s` rewrites every not-found request to the root /index.html,
 * which makes /islenskubraut/ render the landing app and breaks ~89% of
 * the E2E suite.
 */
import { createServer } from 'http';
import { createReadStream, statSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, extname, join, resolve, normalize } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT ?? 4173);

if (!existsSync(distDir)) {
  console.error(`dist/ not found at ${distDir}. Run \`pnpm build\` first.`);
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json; charset=utf-8',
};

// Per-SPA fallback rules (mirroring server/nginx-site.conf).
// Ordered: most specific first.
const SPA_FALLBACKS = [
  { prefix: '/efnafraedi/2-ar/lab-reports/', indexPath: 'efnafraedi/2-ar/lab-reports/index.html' },
  { prefix: '/efnafraedi/3-ar/lab-reports/', indexPath: 'efnafraedi/3-ar/lab-reports/index.html' },
  { prefix: '/islenskubraut/', indexPath: 'islenskubraut/index.html' },
  // /efnafraedi/ and / both fall back to the landing SPA.
  { prefix: '/efnafraedi/', indexPath: 'index.html' },
  { prefix: '/', indexPath: 'index.html' },
];

function resolveSafe(urlPath) {
  // Strip query string and decode, then normalize to prevent path traversal.
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const target = normalize(join(distDir, decoded));
  return target.startsWith(distDir) ? target : null;
}

function tryServeFile(filePath, res) {
  try {
    const stat = statSync(filePath);
    if (stat.isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      createReadStream(filePath).pipe(res);
      return true;
    }
  } catch {
    /* not a file */
  }
  return false;
}

function fallbackIndex(urlPath, res) {
  for (const { prefix, indexPath } of SPA_FALLBACKS) {
    if (urlPath.startsWith(prefix)) {
      const file = join(distDir, indexPath);
      if (existsSync(file)) {
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        createReadStream(file).pipe(res);
        return;
      }
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
}

const server = createServer((req, res) => {
  const urlPath = req.url ?? '/';
  const resolved = resolveSafe(urlPath);
  if (!resolved) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  // Try the exact path first.
  if (tryServeFile(resolved, res)) return;

  // Then try <path>/index.html for directory requests.
  if (tryServeFile(join(resolved, 'index.html'), res)) return;

  // Finally, fall back to the SPA index that owns this URL prefix.
  fallbackIndex(urlPath, res);
});

server.listen(port, () => {
  console.log(`Preview server listening on http://localhost:${port}`);
});
