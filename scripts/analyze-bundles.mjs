#!/usr/bin/env node

/**
 * Bundle analysis script for kvenno-app.
 * Builds lab-reports with ANALYZE=true and reports file sizes across dist/.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(import.meta.dirname, '..', 'dist');

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileSizes(dir, pattern) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true, recursive: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const fullPath = path.join(entry.parentPath || entry.path, entry.name);
    if (pattern && !pattern.test(fullPath)) continue;
    const stat = fs.statSync(fullPath);
    results.push({
      path: path.relative(DIST_DIR, fullPath),
      size: stat.size,
    });
  }
  return results.sort((a, b) => b.size - a.size);
}

function printTable(title, files) {
  if (files.length === 0) {
    console.log(`\n${title}: (no files found)`);
    return;
  }
  console.log(`\n${'='.repeat(70)}`);
  console.log(title);
  console.log(`${'='.repeat(70)}`);
  console.log(`${'File'.padEnd(50)} ${'Size'.padStart(12)}`);
  console.log(`${'-'.repeat(50)} ${'-'.repeat(12)}`);

  let total = 0;
  for (const f of files) {
    total += f.size;
    console.log(`${f.path.padEnd(50)} ${formatSize(f.size).padStart(12)}`);
  }
  console.log(`${'-'.repeat(50)} ${'-'.repeat(12)}`);
  console.log(`${'Total'.padEnd(50)} ${formatSize(total).padStart(12)}`);
}

// Step 1: Build lab-reports with ANALYZE=true
console.log('Building lab-reports with bundle analysis...\n');
try {
  execSync('ANALYZE=true pnpm build:lab-reports', {
    stdio: 'inherit',
    cwd: path.resolve(import.meta.dirname, '..'),
  });
} catch {
  console.error('Lab-reports build failed. Continuing with available dist files...');
}

// Step 2: Report sizes
console.log('\n\nBUNDLE SIZE REPORT');
console.log(`Date: ${new Date().toISOString().slice(0, 10)}`);

// Games (single HTML files)
const gameFiles = getFileSizes(DIST_DIR, /efnafraedi\/.*\/games\/.*\.html$/);
printTable('Chemistry Games (single-file HTML)', gameFiles);

// Lab reports
const labReportFiles = getFileSizes(DIST_DIR, /lab-reports\//);
printTable('Lab Reports', labReportFiles);

// Landing
const landingFiles = getFileSizes(DIST_DIR, /^(?!.*efnafraedi)(?!.*islenskubraut).*\.(html|js|css)$/);
printTable('Landing Page', landingFiles);

// Islenskubraut
const islenskubrautFiles = getFileSizes(DIST_DIR, /islenskubraut\//);
printTable('Islenskubraut', islenskubrautFiles);

// Summary
console.log(`\n${'='.repeat(70)}`);
console.log('SUMMARY');
console.log(`${'='.repeat(70)}`);

const allFiles = getFileSizes(DIST_DIR);
const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
console.log(`Total files: ${allFiles.length}`);
console.log(`Total size:  ${formatSize(totalSize)}`);

// Check for stats.html from visualizer
const statsPath = path.resolve(import.meta.dirname, '..', 'apps', 'lab-reports', 'stats.html');
if (fs.existsSync(statsPath)) {
  console.log(`\nBundle visualizer report: ${statsPath}`);
}
