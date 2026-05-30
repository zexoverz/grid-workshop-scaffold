# Single-process container for archetype E.
#   docker build -t archetype-e -f archetypes/E-head-trader/Dockerfile .
#   docker run --rm -p 8080:8080 --env-file .env archetype-e
# NOTE: build context must be the repo root (for npm workspaces resolution).

FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./
COPY shared ./shared
COPY archetypes/E-head-trader ./archetypes/E-head-trader

RUN npm ci --omit=optional --ignore-scripts && npm cache clean --force

EXPOSE 8080
ENV PORT=8080

CMD ["npx", "--no-install", "tsx", "archetypes/E-head-trader/src/server.ts"]
