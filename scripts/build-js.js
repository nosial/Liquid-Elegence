/**
 * Liquid Elegance — JS Build Script
 * Copies all .js files from src/js/ to dist/full/js/, including subdirectories
 */
const fs = require('fs');
const path = require('path');

const SRC_JS = path.join(__dirname, '..', 'src', 'js');
const DIST_JS = path.join(__dirname, '..', 'dist', 'full', 'js');
let exitCode = 0;

if (!fs.existsSync(SRC_JS)) {
    console.log('No src/js/ directory found — nothing to copy.');
    process.exit(0);
}

fs.mkdirSync(DIST_JS, { recursive: true });

let copied = 0;

function copyJsFiles(srcDir, destDir) {
    fs.mkdirSync(destDir, { recursive: true });

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            copyJsFiles(srcPath, destPath);
        } else if (entry.name.endsWith('.js')) {
            try {
                fs.copyFileSync(srcPath, destPath);
                copied++;
            } catch (err) {
                console.error(`Error copying ${path.relative(SRC_JS, srcPath)}: ${err.message}`);
            }
        }
    }
}

copyJsFiles(SRC_JS, DIST_JS);

if (copied === 0) {
    console.log('No .js files found in src/js/ — nothing to copy.');
} else {
    console.log(`Copied ${copied} JS file${copied !== 1 ? 's' : ''} to dist/full/js/`);
}
process.exit(exitCode);
