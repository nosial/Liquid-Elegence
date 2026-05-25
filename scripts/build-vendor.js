/**
 * Liquid Elegance — Vendor Build Script
 * Copies vendor assets from node_modules to dist/full/vendor/
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST_VENDOR = path.join(ROOT, 'dist', 'full', 'vendor');
let exitCode = 0;

/**
 * Copy a file, creating destination directories as needed.
 * @param {string} src  - Absolute source path
 * @param {string} dest - Absolute destination path
 */
function copyFile(src, dest) {
    const dir = path.dirname(dest);
    fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(src)) {
        console.warn(`  SKIP (not found): ${path.relative(ROOT, src)}`);
        return false;
    }

    try {
        fs.copyFileSync(src, dest);
    } catch (err) {
        console.error(`  ERROR copying ${path.relative(ROOT, src)}: ${err.message}`);
        return false;
    }
    return true;
}

// Define vendor files to copy: [source (relative to node_modules), dest dir, dest filename (optional rename)]
const VENDOR_FILES = [
    {
        src: 'bootstrap/dist/js/bootstrap.bundle.min.js',
        destDir: 'bootstrap',
        destName: 'bootstrap.bundle.min.js'
    },
    {
        src: 'bootstrap/dist/js/bootstrap.bundle.min.js.map',
        destDir: 'bootstrap',
        destName: 'bootstrap.bundle.min.js.map'
    },
    {
        src: 'feather-icons/dist/feather.min.js',
        destDir: 'feather-icons',
        destName: 'feather.min.js'
    },
    {
        src: 'feather-icons/dist/feather.min.js.map',
        destDir: 'feather-icons',
        destName: 'feather.min.js.map'
    },
    {
        src: 'chart.js/dist/chart.umd.js',
        destDir: 'chart.js',
        destName: 'chart.min.js'
    }
];

let copied = 0;
let skipped = 0;

for (const file of VENDOR_FILES) {
    const srcPath = path.join(ROOT, 'node_modules', file.src);
    const destPath = path.join(DIST_VENDOR, file.destDir, file.destName);

    if (copyFile(srcPath, destPath)) {
        copied++;
    } else {
        skipped++;
    }
}

console.log(`Copied ${copied} vendor file${copied !== 1 ? 's' : ''} to dist/full/vendor/`);
if (skipped > 0) {
    console.warn(`${skipped} file${skipped !== 1 ? 's' : ''} skipped (not found).`);
    exitCode = 1;
}
process.exit(exitCode);
