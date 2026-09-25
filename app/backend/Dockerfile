FROM node:22-bookworm AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist/ ./dist
COPY mydatabase.db ./

EXPOSE 3000

CMD ["node", "dist/main.js"]


