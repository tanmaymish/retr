# Heritage Ledger — one image serving the API and the built client.
#
# Same-origin by construction: the API serves the SPA, so there is no CORS and
# no cross-site cookie in production.

FROM node:22-bookworm-slim AS client
WORKDIR /build
COPY app/package.json app/package-lock.json ./app/
RUN npm --prefix app ci
COPY app ./app
RUN npm --prefix app run build

FROM node:22-bookworm-slim AS server-deps
WORKDIR /build
# better-sqlite3 builds from source when no prebuild matches this platform.
RUN apt-get update \
  && apt-get install --no-install-recommends -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json ./server/
RUN npm --prefix server ci --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=4000 \
    HOST=0.0.0.0 \
    DATA_DIR=/data \
    CLIENT_DIR=/app/app/dist

WORKDIR /app
COPY --from=server-deps /build/server/node_modules ./server/node_modules
COPY server/package.json ./server/
COPY server/src ./server/src
COPY --from=client /build/app/dist ./app/dist

# Documents and the database live on a volume; the application directory itself
# stays read-only as far as the app is concerned.
RUN mkdir -p /data && chown -R node:node /data
VOLUME ["/data"]

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/src/index.js"]
