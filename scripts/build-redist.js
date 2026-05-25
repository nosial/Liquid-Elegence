#!/usr/bin/env node
/**
 * Liquid Elegance — Redist Assembly Script
 * Assembles dist/redist/ with all variant CSS, shared JS, vendor, and assets.
 */
const fs = require('fs');
const path = require('path');
const copyDir = require('./lib/copy-dir');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const FULL = path.join(DIST, 'full');
const REDIST = path.join(DIST, 'redist');

const DYNAMICAL_WEB = path.join(ROOT, 'src', 'dynamical_web');
const DYNAMICAL_LOCALE = path.join(ROOT, 'src', 'dynamical_locale');
const TEMPLATE_YML = path.join(ROOT, 'template.yml');

    // 1. Copy full build CSS to dist/redist/css/
const fullCssFiles = ['liquid-elegance.css', 'liquid-elegance.css.map',
                      'liquid-elegance.dev.css', 'liquid-elegance.dev.css.map'];
const redistCss = path.join(REDIST, 'css');
fs.mkdirSync(redistCss, { recursive: true });
for (const f of fullCssFiles) {
    const src = path.join(FULL, 'css', f);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(redistCss, f));
    }
}
console.log('Copied full CSS build to dist/redist/css/');

// 2. Copy JS (exclude theme-customizer.js for variant use, but include in redist)
const jsCount = copyDir(path.join(FULL, 'js'), path.join(REDIST, 'js'));
console.log(`Copied ${jsCount} JS files to dist/redist/js/`);

// 3. Copy vendor
const vendorCount = copyDir(path.join(FULL, 'vendor'), path.join(REDIST, 'vendor'));
console.log(`Copied ${vendorCount} vendor files to dist/redist/vendor/`);

// 4. Copy assets
const assetsCount = copyDir(path.join(FULL, 'assets'), path.join(REDIST, 'assets'));
console.log(`Copied ${assetsCount} asset files to dist/redist/assets/`);

// 5. Copy DynamicalWeb template files
const dwCount = copyDir(DYNAMICAL_WEB, path.join(REDIST, 'dynamical_web'));
console.log(`Copied ${dwCount} files to dist/redist/dynamical_web/`);

const dlCount = copyDir(DYNAMICAL_LOCALE, path.join(REDIST, 'dynamical_locale'));
console.log(`Copied ${dlCount} files to dist/redist/dynamical_locale/`);

if (fs.existsSync(TEMPLATE_YML)) {
    fs.copyFileSync(TEMPLATE_YML, path.join(REDIST, 'template.yml'));
    console.log('Copied template.yml to dist/redist/');
}

console.log('\nRedist assembly complete: dist/redist/');
