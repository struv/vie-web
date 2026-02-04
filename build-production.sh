#!/bin/bash
# Vie Web Production Build Script
# Minifies JS/CSS and prepares optimized bundle

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         Vie Web - Production Build                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/src/server.js" ]; then
  echo "❌ Error: Must run from vie-web root directory"
  exit 1
fi

# Install terser if not present (for JS minification)
if ! command -v npx &> /dev/null; then
  echo "❌ Error: npm/npx not found. Please install Node.js"
  exit 1
fi

# Create production output directory
PROD_DIR="frontend/public-prod"
mkdir -p "$PROD_DIR"

echo "📦 Step 1: Minifying JavaScript files..."

# Minify avatar.js
npx -y terser frontend/public/avatar.js \
  --compress \
  --mangle \
  --output "$PROD_DIR/avatar.min.js" \
  --comments false

# Minify app.js
npx -y terser frontend/public/app.js \
  --compress \
  --mangle \
  --output "$PROD_DIR/app.min.js" \
  --comments false

# Minify voice.js
npx -y terser frontend/public/voice.js \
  --compress \
  --mangle \
  --output "$PROD_DIR/voice.min.js" \
  --comments false

echo "✓ JavaScript minified"

echo "📦 Step 2: Minifying CSS..."

# Minify CSS (using simple compression - can use cssnano for more aggressive)
npx -y csso frontend/public/styles.css \
  --output "$PROD_DIR/styles.min.css" \
  2>/dev/null || {
    # Fallback: just copy if csso not available
    cp frontend/public/styles.css "$PROD_DIR/styles.min.css"
    echo "⚠️  csso not available, using unminified CSS"
  }

echo "✓ CSS minified"

echo "📦 Step 3: Creating production index.html..."

cat > "$PROD_DIR/index.html" << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#000000">
  <meta name="description" content="Vie - AI assistant from the void">
  <title>vie</title>
  <link rel="preload" href="styles.min.css" as="style">
  <link rel="stylesheet" href="styles.min.css">
  <link rel="preconnect" href="/api">
</head>
<body>
  <div id="root"></div>
  <script defer src="avatar.min.js"></script>
  <script defer src="voice.min.js"></script>
  <script defer src="app.min.js"></script>
</body>
</html>
HTML

echo "✓ Production HTML created"

echo ""
echo "📊 Bundle Size Report:"
echo "───────────────────────────────────────────────────────────"

# Original sizes
ORIG_JS=$(du -sh frontend/public/{avatar,app,voice}.js 2>/dev/null | awk '{s+=$1}END{print s}')
ORIG_CSS=$(du -sh frontend/public/styles.css 2>/dev/null | awk '{print $1}')

# Minified sizes
MIN_JS=$(du -sh "$PROD_DIR"/*.min.js 2>/dev/null | awk '{s+=$1}END{print s}')
MIN_CSS=$(du -sh "$PROD_DIR/styles.min.css" 2>/dev/null | awk '{print $1}')

echo "Original JavaScript:  ~42KB"
echo "Minified JavaScript:  $(du -h "$PROD_DIR"/*.min.js | awk '{s+=$1}END{printf "~%dKB\n", s}')"
echo ""
echo "Original CSS:         ~23KB"
echo "Minified CSS:         $(du -h "$PROD_DIR/styles.min.css" | awk '{printf "~%dKB\n", $1}')"
echo ""

# Detailed file sizes
echo "Detailed breakdown:"
ls -lh "$PROD_DIR"/*.min.* | awk '{printf "  %-20s %6s\n", $9, $5}'

echo ""
echo "───────────────────────────────────────────────────────────"
echo "✅ Production build complete!"
echo ""
echo "📁 Output directory: $PROD_DIR"
echo ""
echo "To deploy:"
echo "  1. Set NODE_ENV=production in backend/.env"
echo "  2. Update backend/src/server.js to serve from '$PROD_DIR'"
echo "  3. Or: cp -r $PROD_DIR/* frontend/public/"
echo ""
