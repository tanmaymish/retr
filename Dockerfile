# Akshayvriddhi — one image serving the API and the built client.
#
# Same-origin by construction: the API serves the SPA, so there is no CORS and
# no cross-site cookie in production.
#
# The repository is a single npm workspace, so every stage installs from the
# root lockfile. Installing inside app/ or server/ would resolve the workspace
# root above it anyway.

FROM node:22-bookworm-slim AS base
WORKDIR /build
# better-sqlite3 compiles from source when no prebuild matches the platform.
RUN apt-get update \
  && apt-get install --no-install-recommends -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY app/package.json ./app/
COPY server/package.json ./server/

# ── Client build ─────────────────────────────────────────────────────────────
FROM base AS client
RUN npm ci
COPY app ./app
# The preparedness scoring is shared: the client imports it for a static build,
# the server imports it to serve /api/preparedness.
COPY shared ./shared
RUN npm run build

# ── Runtime dependencies ─────────────────────────────────────────────────────
# Only the server's production dependencies: the client is already built, so
# React and Vite have no business in the runtime image.
FROM base AS server-deps
RUN npm ci --omit=dev --workspace @akshayvriddhi/server

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=4000 \
    HOST=0.0.0.0 \
    DATA_DIR=/data \
    CLIENT_DIR=/app/app/dist

WORKDIR /app
# npm hoists workspace dependencies to the root node_modules, which is where
# Node resolves them from when running server/src.
COPY --from=server-deps /build/node_modules ./node_modules
COPY package.json ./
COPY server/package.json ./server/
COPY server/src ./server/src
COPY server/scripts ./server/scripts
COPY shared ./shared
COPY --from=client /build/app/dist ./app/dist

# The database and encrypted documents live on a volume.
RUN mkdir -p /data && chown -R node:node /data
VOLUME ["/data"]

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/src/index.js"]
