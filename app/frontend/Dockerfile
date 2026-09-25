FROM node:22.23-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM nginx:stable-alpine3.24-slim

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=builder /app/dist/fr-administration-front/browser/ /usr/share/nginx/html/

ENV API_URL=http://localhost:3000

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
