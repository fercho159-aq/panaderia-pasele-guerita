FROM node:20-slim AS base

WORKDIR /app
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/ui/package.json ./packages/ui/
COPY packages/web/package.json ./packages/web/

RUN npm install

COPY . .

# Build step
RUN npm run build --workspace=@pasele-guerita/core
RUN npm run build --workspace=@pasele-guerita/ui
RUN npm run build --workspace=@pasele-guerita/web

FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=base /app/packages/web/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321

CMD ["node", "./dist/server/entry.mjs"]
