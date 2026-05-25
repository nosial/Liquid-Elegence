# Liquid Elegance — Bootstrap 5 Admin Template
# Build system for compiling SCSS, rendering Nunjucks templates, and packaging assets
# Use `make -j` to build independent targets in parallel

.PHONY: all build clean install dev css js vendor html assets variants redist rebuild

# Default target
all: build

# Install dependencies
install:
	npm install

# Independent build targets (parallelizable with make -j)
vendor: install
	npm run build:vendor

css: install
	npm run build:css

js: install
	npm run build:js

assets: install
	npm run build:assets

variants: install
	npm run build:variants

# HTML rendering depends on all other build outputs
html: vendor css js assets variants
	npm run build:html

# Full production build (use `make -j` for parallel compilation)
build: html

# Clean build artifacts
clean:
	npm run clean

# Development watch mode (CSS only)
dev: install
	npm run watch:css

redist:
	npm run build:redist

# Rebuild everything from scratch
rebuild: clean build
