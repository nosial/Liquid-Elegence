/**
 * Liquid Elegance — Assets Build Script
 * Recursively copies src/assets/ to dist/full/assets/
 * Creates placeholder files if img directory is empty.
 */
const fs = require('fs');
const path = require('path');
const copyDir = require('./lib/copy-dir');

const DIST_ASSETS = path.join(__dirname, '..', 'dist', 'full', 'assets');
let exitCode = 0;

/**
 * Check if a directory is empty (no files, only empty subdirs).
 * @param {string} dir
 * @returns {boolean}
 */
function isDirEmpty(dir) {
    if (!fs.existsSync(dir)) return true;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) return false;
        if (!isDirEmpty(path.join(dir, entry.name))) return false;
    }
    return true;
}


// Create placeholder files if the img directory is empty
const distImgDir = path.join(DIST_ASSETS, 'img');
if (isDirEmpty(distImgDir)) {
    fs.mkdirSync(distImgDir, { recursive: true });
    const placeholder = path.join(distImgDir, '.gitkeep');
    if (!fs.existsSync(placeholder)) {
        fs.writeFileSync(placeholder, '');
    }
    console.log('Created placeholder in dist/full/assets/img/ (source directory was empty).');
}

process.exit(exitCode);
