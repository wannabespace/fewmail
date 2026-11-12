# syntax=docker/dockerfile:1
# Built with the repo root as the context: Vite bundles the workspace packages, Caddy serves the result.

FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app
COPY --parents package.json pnpm-lock.yaml pnpm-workspace.yaml apps/*/package.json packages/*/package.json ./
# The root's install scripts start the local portless proxy.
RUN pnpm install --frozen-lockfile --ignore-scripts --filter @fewmail/web...
RUN pnpm rebuild --filter @fewmail/web...
COPY . .
# Railway passes service variables to the build only when they are declared here; Vite inlines API_URL.
ARG API_URL
ARG WEB_URL
ARG RAILWAY_GIT_COMMIT_SHA
RUN pnpm --dir apps/web run build

FROM caddy:2-alpine
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv
