#!/usr/bin/env node
const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');
const copyDir = require('./lib/copy-dir');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'templates');
const DIST = path.join(ROOT, 'dist');
const FULL = path.join(DIST, 'full');
const VARIANT_CSS = path.join(DIST, '.variant-css');

const SRC_DYNAMICAL_WEB = path.join(ROOT, 'src', 'dynamical_web');
const SRC_DYNAMICAL_LOCALE = path.join(ROOT, 'src', 'dynamical_locale');
const TEMPLATE_YML = path.join(ROOT, 'template.yml');

const VALID_COLORS = ['default', 'ocean', 'sunset', 'forest', 'berry', 'slate', 'ruby', 'amber', 'rose', 'midnight', 'coral', 'sage'];
const VALID_MODES = ['light', 'dark'];
const VALID_LAYOUTS = ['vertical', 'horizontal'];

let exitCode = 0;

const [color, mode, layout] = process.argv.slice(2);

if (!color || !mode || !layout) {
  console.error('Usage: node scripts/build-variant-html.js <color> <mode> <layout>');
  process.exit(1);
}
if (!VALID_COLORS.includes(color)) {
  console.error(`Invalid color: "${color}". Valid: ${VALID_COLORS.join(', ')}`);
  process.exit(1);
}
if (!VALID_MODES.includes(mode)) {
  console.error(`Invalid mode: "${mode}". Valid: ${VALID_MODES.join(', ')}`);
  process.exit(1);
}
if (!VALID_LAYOUTS.includes(layout)) {
  console.error(`Invalid layout: "${layout}". Valid: ${VALID_LAYOUTS.join(', ')}`);
  process.exit(1);
}

const folderName = `${color}-${mode}-${layout}`;
const variantDir = path.join(DIST, folderName);
const cssVariantName = `${mode}-${color}`;

const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(SRC, { noCache: true }),
  { autoescape: false, trimBlocks: true, lstripBlocks: true }
);

function findPages(dir) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findPages(fullPath));
    } else if (entry.name.endsWith('.njk')) {
      results.push(fullPath);
    }
  }
  return results;
}

const pagesDir = path.join(SRC, 'pages');
const pages = findPages(pagesDir);
const indexTemplate = path.join(SRC, 'index.njk');
if (fs.existsSync(indexTemplate)) {
  pages.push(indexTemplate);
}

if (pages.length === 0) {
  console.log('No .njk pages found — nothing to render.');
  process.exit(0);
}

fs.mkdirSync(variantDir, { recursive: true });
copyDir(path.join(FULL, 'js'), path.join(variantDir, 'js'));
copyDir(path.join(FULL, 'vendor'), path.join(variantDir, 'vendor'));
copyDir(path.join(FULL, 'assets'), path.join(variantDir, 'assets'));

const variantCssDir = path.join(variantDir, 'css');
fs.mkdirSync(variantCssDir, { recursive: true });
const srcCss = path.join(VARIANT_CSS, `${cssVariantName}.css`);
const srcMap = path.join(VARIANT_CSS, `${cssVariantName}.css.map`);
if (fs.existsSync(srcCss)) {
  fs.copyFileSync(srcCss, path.join(variantCssDir, 'liquid-elegance.css'));
}
if (fs.existsSync(srcMap)) {
  fs.copyFileSync(srcMap, path.join(variantCssDir, 'liquid-elegance.css.map'));
}

// Copy DynamicalWeb template assets
copyDir(SRC_DYNAMICAL_WEB, path.join(variantDir, 'dynamical_web'));
copyDir(SRC_DYNAMICAL_LOCALE, path.join(variantDir, 'dynamical_locale'));
if (fs.existsSync(TEMPLATE_YML)) {
  fs.copyFileSync(TEMPLATE_YML, path.join(variantDir, 'template.yml'));
}

const context = {
  is_variant: true,
  variant_theme: mode,
  variant_color: color,
  variant_layout: layout === 'horizontal' ? 'horizontal' : 'sidebar',
};

let count = 0;
let errors = 0;

for (const page of pages) {
  const relTemplate = path.relative(SRC, page);
  const relOutput = relTemplate === 'index.njk' ? 'index.html' : relTemplate.replace(/\.njk$/, '.html');
  const outPath = path.join(variantDir, relOutput);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  try {
    const html = env.render(relTemplate, context);
    fs.writeFileSync(outPath, html);
    count++;
  } catch (err) {
    console.error(`Error rendering ${relTemplate}: ${err.message}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`${folderName}: ${count} pages rendered, ${errors} errors`);
  exitCode = 1;
} else {
  console.log(`${folderName}: ${count} pages rendered`);
}

process.exit(exitCode);
