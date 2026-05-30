# Single-process container for archetype C.
#   docker build -t archetype-c -f archetypes/C-chief-strategist/Dockerfile .
#   docker run --rm -p 8080:8080 --env-file .env archetype-c
# NOTE: build context must be the repo root (for npm workspaces resolution).

FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./
COPY shared ./shared
COPY archetypes/C-chief-strategist ./archetypes/C-chief-strategist

RUN npm ci --omit=optional --ignore-scripts && npm cache clean --force

EXPOSE 8080
ENV PORT=8080

CMD ["npx", "--no-install", "tsx", "archetypes/C-chief-strategist/src/server.ts"]
