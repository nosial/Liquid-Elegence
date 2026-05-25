#!/usr/bin/env node
/**
 * Liquid Elegance — Variant CSS Build Script
 * Compiles per-variant SCSS files into dist/.variant-css/ as an intermediate
 * staging area. The HTML build script copies these into each variant folder.
 * Uses Sass many-to-many compilation to batch all variants per style in a single
 * invocation, avoiding repeated Dart VM startup overhead.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VARIANTS_DIR = path.join(ROOT, 'src', 'scss', 'variants');
const VARIANT_CSS = path.join(ROOT, 'dist', '.variant-css');
const SASS_OPTS = '--load-path=node_modules --quiet-deps --no-error-css';
let exitCode = 0;

fs.mkdirSync(VARIANT_CSS, { recursive: true });

const variantFiles = fs.readdirSync(VARIANTS_DIR).filter(f => f.endsWith('.scss'));

if (variantFiles.length === 0) {
  console.log('No variant SCSS files found — nothing to compile.');
  process.exit(0);
}

// Build source:output pairs for Sass many-to-many compilation
const compressedPairs = variantFiles.map(file => {
  const name = file.replace('.scss', '');
  return `src/scss/variants/${file}:dist/.variant-css/${name}.css`;
});
const expandedPairs = variantFiles.map(file => {
  const name = file.replace('.scss', '');
  return `src/scss/variants/${file}:dist/.variant-css/${name}.dev.css`;
});

try {
  execSync(
    `sass ${compressedPairs.join(' ')} --style=compressed --source-map ${SASS_OPTS}`,
    { cwd: ROOT, stdio: 'pipe' }
  );
  execSync(
    `sass ${expandedPairs.join(' ')} --style=expanded --source-map ${SASS_OPTS}`,
    { cwd: ROOT, stdio: 'pipe' }
  );

  for (const file of variantFiles) {
    process.stdout.write(`  ✓ ${file.replace('.scss', '')}\n`);
  }
  console.log(`\nCompiled ${variantFiles.length} variant CSS files to dist/.variant-css/`);
} catch (err) {
  console.error(`Variant compilation failed:\n${err.stderr?.toString() || err.message}`);
  exitCode = 1;
}
process.exit(exitCode);
