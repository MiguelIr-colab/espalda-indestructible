FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

ENV VITE_API_URL=https://api2.espaldaindestructible.com
ENV VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51QiLdnLv0O1dNyb5yj8OC8mIlsw2JNRupZxGEsRsz7opO5P28NpNZIb4gIuTYpFjt9FhZ9rk5t7NN4bao8YWjt0c00izSQSz4q
ENV VITE_RECAPTCHA_SITE_KEY=6Le8yxYsAAAAADMytv4HJO7fZMaWpIWwyzRe0QZA

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
