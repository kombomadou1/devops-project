FROM node:22.23-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:22.23-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist/ ./dist
COPY mydatabase.db ./

EXPOSE 3000

CMD ["node", "dist/main.js"]


