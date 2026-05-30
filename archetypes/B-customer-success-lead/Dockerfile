# Single-process container for archetype B.
#   docker build -t archetype-b -f archetypes/B-customer-success-lead/Dockerfile .
#   docker run --rm -p 8080:8080 --env-file .env archetype-b
# NOTE: build context must be the repo root (for npm workspaces resolution).

FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./
COPY shared ./shared
COPY archetypes/B-customer-success-lead ./archetypes/B-customer-success-lead

RUN npm ci --omit=optional --ignore-scripts && npm cache clean --force

EXPOSE 8080
ENV PORT=8080

CMD ["npx", "--no-install", "tsx", "archetypes/B-customer-success-lead/src/server.ts"]
