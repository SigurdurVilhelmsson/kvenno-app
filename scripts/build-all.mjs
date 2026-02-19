#!/usr/bin/env node
/**
 * Unified build orchestrator for kvenno.app
 *
 * Builds all apps into dist/ with the correct directory structure:
 *   dist/
 *   ├── index.html                  # Landing page
 *   ├── assets/                     # Landing JS/CSS chunks
 *   ├── media/                      # Favicons
 *   ├── 1-ar/
 *   │   ├── index.html             # Year 1 hub (SPA route)
 *   │   └── games/
 *   │       ├── molmassi.html
 *   │       └── ...
 *   ├── 2-ar/
 *   │   ├── index.html
 *   │   ├── games/...
 *   │   └── lab-reports/
 *   ├── 3-ar/
 *   │   ├── index.html
 *   │   ├── games/...
 *   │   └── lab-reports/
 *   ├── val/index.html
 *   └── f-bekkir/index.html
 */

import { execSync } from 'child_process';
import { cpSync, mkdirSync, rmSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const skipGames = args.includes('--skip-games');
const skipLabReports = args.includes('--skip-lab-reports');
const skipLanding = args.includes('--skip-landing');

const stdio = verbose ? 'inherit' : 'pipe';

console.log('🏗️  kvenno.app Unified Build\n');

// Step 0: Clean dist
if (existsSync(distDir)) {
  console.log('🧹 Cleaning dist/...');
  rmSync(distDir, { recursive: true });
}
mkdirSync(distDir, { recursive: true });

// Step 1: Build landing app
if (!skipLanding) {
  console.log('\n📄 Building landing app...');
  try {
    execSync('pnpm --filter @kvenno/landing build', { cwd: rootDir, stdio });
    console.log('   ✅ Landing app built');
  } catch (error) {
    console.error('   ❌ Landing build failed:', error.message);
    process.exit(1);
  }
}

// Step 1b: Copy landing SPA index.html to sub-routes for direct URL access
if (!skipLanding) {
  const spaRoutes = ['1-ar', '2-ar', '3-ar', 'val', 'f-bekkir'];
  for (const route of spaRoutes) {
    const routeDir = join(distDir, route);
    mkdirSync(routeDir, { recursive: true });
    copyFileSync(join(distDir, 'index.html'), join(routeDir, 'index.html'));
  }
  console.log('   ✅ SPA routes created for year hubs');
}

// Step 2: Build games
if (!skipGames) {
  console.log('\n🎮 Building games...');
  try {
    execSync('node scripts/build-games.mjs', { cwd: rootDir, stdio });
    console.log('   ✅ Games built');
  } catch (error) {
    console.error('   ❌ Games build failed:', error.message);
    process.exit(1);
  }
}

// Step 3: Build lab reports (2x with different base paths)
if (!skipLabReports) {
  const labReportsDir = join(rootDir, 'apps', 'lab-reports');

  for (const year of ['2-ar', '3-ar']) {
    const basePath = `/${year}/lab-reports/`;
    const outputDir = join(distDir, year, 'lab-reports');

    console.log(`\n📝 Building lab-reports for ${basePath}...`);
    mkdirSync(outputDir, { recursive: true });

    try {
      execSync(`VITE_BASE_PATH=${basePath} npx vite build --outDir ${outputDir}`, {
        cwd: labReportsDir,
        stdio,
        env: { ...process.env, VITE_BASE_PATH: basePath },
      });
      console.log(`   ✅ Lab reports built for ${year}`);
    } catch (error) {
      console.error(`   ❌ Lab reports build failed for ${year}:`, error.message);
      process.exit(1);
    }
  }
}

// Step 4: Copy media assets
console.log('\n🖼️  Copying media assets...');
const mediaSource = join(rootDir, 'media');
const mediaDest = join(distDir, 'media');
if (existsSync(mediaSource)) {
  cpSync(mediaSource, mediaDest, { recursive: true });
  console.log('   ✅ Media copied');
}

// Summary
console.log('\n✅ Build complete!');
console.log(`   Output: ${distDir}`);
console.log('\n   Test locally with: npx serve dist/');
