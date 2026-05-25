/**
 * Recursively copy a directory.
 * @param {string} src  - Source directory
 * @param {string} dest - Destination directory
 * @returns {number} Number of files copied
 */
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return 0;

    fs.mkdirSync(dest, { recursive: true });
    let count = 0;

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            count += copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            count++;
        }
    }

    return count;
}

module.exports = copyDir;
