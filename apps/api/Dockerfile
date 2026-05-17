FROM node:18-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @sololearning/api --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=builder /app/out/full/ .
RUN npm run build --filter=@sololearning/api...

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=installer --chown=expressjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=expressjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=installer --chown=expressjs:nodejs /app/node_modules ./node_modules

CMD node apps/api/dist/index.js
