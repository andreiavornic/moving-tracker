# Stage 1: Install dependencies + build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build entire monorepo (apps + libs)
RUN npx nest build

# Stage 2: API runtime
FROM node:20-alpine AS api
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist

CMD ["node", "dist/apps/moving-tracker/main.js"]

# Stage 3: Worker runtime
FROM node:20-alpine AS worker
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist

CMD ["node", "dist/apps/worker/main.js"]
