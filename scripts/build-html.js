/**
 * Liquid Elegance — HTML Build Script
 * Renders Nunjucks templates from src/templates/ into dist/
 *
 * Outputs:
 *   1. dist/full/           — Full build with all CSS variants, customizer enabled
 *   2. dist/<color>-<mode>-<layout>/  — Self-contained variant demos (no customizer)
 *      e.g. dist/ocean-dark-vertical/, dist/default-light-horizontal/
 */
const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');
const copyDir = require('./lib/copy-dir');

const SRC = path.join(__dirname, '..', 'src', 'templates');
const DIST = path.join(__dirname, '..', 'dist');
const FULL = path.join(DIST, 'full');
const VARIANT_CSS = path.join(DIST, '.variant-css');

let exitCode = 0;

const MODES = ['light', 'dark'];
const LAYOUTS = ['vertical', 'horizontal'];
const COLORS = ['default', 'ocean', 'sunset', 'forest', 'berry', 'slate', 'ruby', 'amber', 'rose', 'midnight', 'coral', 'sage'];

// Configure nunjucks
const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(SRC, { noCache: true }),
    { autoescape: false, trimBlocks: true, lstripBlocks: true }
);

/**
 * Recursively find all .njk files in a directory.
 */
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

/**
 * Collect all renderable page templates.
 */
function collectPages() {
    const pagesDir = path.join(SRC, 'pages');
    const pages = findPages(pagesDir);
    const indexTemplate = path.join(SRC, 'index.njk');
    if (fs.existsSync(indexTemplate)) {
        pages.push(indexTemplate);
    }
    return pages;
}

/**
 * Render a set of pages to a target directory.
 * @param {string[]} pages - absolute paths to .njk templates
 * @param {string} targetDir - output directory
 * @param {object} context - extra Nunjucks context variables
 * @returns {{ count: number, errors: number }}
 */
function renderPages(pages, targetDir, context = {}) {
    let count = 0;
    let errors = 0;

    for (const page of pages) {
        const relTemplate = path.relative(SRC, page);
        let relOutput;
        if (relTemplate === 'index.njk') {
            relOutput = 'index.html';
        } else {
            relOutput = relTemplate.replace(/\.njk$/, '.html');
        }

        const outPath = path.join(targetDir, relOutput);
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

    return { count, errors };
}

/**
 * Assemble a self-contained variant demo folder.
 * Copies JS, vendor, assets from the full build, plus the variant's CSS.
 */
function assembleVariantAssets(variantDir, cssVariantName) {
    // Copy JS
    copyDir(path.join(FULL, 'js'), path.join(variantDir, 'js'));

    // Copy vendor
    copyDir(path.join(FULL, 'vendor'), path.join(variantDir, 'vendor'));

    // Copy assets
    copyDir(path.join(FULL, 'assets'), path.join(variantDir, 'assets'));

    // Copy variant CSS as liquid-elegance.css (the default expected by templates)
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
}

// ============================================================================
// Main
// ============================================================================
const pages = collectPages();
if (pages.length === 0) {
    console.log('No .njk pages found — nothing to render.');
    process.exit(0);
}

// Verify full build assets exist before copying variants
if (!fs.existsSync(path.join(FULL, 'js')) && COLORS.length > 0) {
    console.warn('Warning: dist/full/js/ not found. Variant asset copies may be incomplete.');
}

let totalCount = 0;
let totalErrors = 0;

// 1. Full build → dist/full/ (already has css/, js/, vendor/, assets/ from prior build steps)
const full = renderPages(pages, FULL);
totalCount += full.count;
totalErrors += full.errors;
console.log(`Rendered ${full.count} HTML pages to dist/full/`);

// 2. Self-contained variant demos → dist/<color>-<mode>-<layout>/
for (const color of COLORS) {
    for (const mode of MODES) {
        for (const layout of LAYOUTS) {
            const folderName = `${color}-${mode}-${layout}`;
            const variantDir = path.join(DIST, folderName);
            const cssVariantName = `${mode}-${color}`;

            // Copy assets into self-contained folder
            assembleVariantAssets(variantDir, cssVariantName);

            const context = {
                is_variant: true,
                variant_theme: mode,
                variant_color: color,
                variant_layout: layout === 'horizontal' ? 'horizontal' : 'sidebar',
            };

            const result = renderPages(pages, variantDir, context);
            totalCount += result.count;
            totalErrors += result.errors;

            if (result.errors > 0) {
                console.error(`  ✗ ${folderName}: ${result.errors} errors`);
            } else {
                process.stdout.write(`  ✓ ${folderName} (${result.count} pages)\n`);
            }
        }
    }
}

console.log(`\nTotal: ${totalCount} HTML pages rendered`);
if (totalErrors > 0) {
    console.error(`${totalErrors} total rendering errors.`);
    exitCode = 1;
}
process.exit(exitCode);
