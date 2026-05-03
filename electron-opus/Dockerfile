# ==============================================================================
# AutoService Desktop — Build image for Linux distributables
# ==============================================================================
# Produces: dist/*.AppImage, dist/*.deb, dist/*.rpm
#
# Usage:
#   docker build -t autoservice-desktop-builder .
#   docker run --rm -v $(pwd)/dist:/app/dist autoservice-desktop-builder
#
# For Windows builds add: --win (requires Wine — see comment at bottom)
# ==============================================================================

FROM node:20-bullseye-slim

# Dependencies required by electron-builder for Linux packaging
RUN apt-get update && apt-get install -y --no-install-recommends \
    # AppImage
    fakeroot \
    rpm \
    # electron binary deps
    libgtk-3-0 \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libxss1 \
    libxtst6 \
    xvfb \
    # misc
    ca-certificates \
    unzip \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache npm install layer separately from source
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build renderer + main via electron-vite, then package with electron-builder
RUN npm run build && \
    npx electron-builder --linux --publish never

# Default: copy artifacts to /output so the caller can mount it
CMD ["sh", "-c", "cp -r dist/* /output/ 2>/dev/null; echo 'Build complete. Artifacts in /output'"]
