# Single-process container for archetype D.
#   docker build -t archetype-d -f archetypes/D-operations-officer/Dockerfile .
#   docker run --rm -p 8080:8080 --env-file .env archetype-d
# NOTE: build context must be the repo root (for npm workspaces resolution).

FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./
COPY shared ./shared
COPY archetypes/D-operations-officer ./archetypes/D-operations-officer

RUN npm ci --omit=optional --ignore-scripts && npm cache clean --force

EXPOSE 8080
ENV PORT=8080

CMD ["npx", "--no-install", "tsx", "archetypes/D-operations-officer/src/server.ts"]
