#docker build -t bambu-http-proxy:latest .
#FROM ghcr.io/puppeteer/puppeteer:latest
FROM node:20.9.0
# ✅ PING installieren (für ICMP im OfflineDetectionService)
RUN apt-get update && apt-get install -y iputils-ping
# App-Setup
WORKDIR /app
COPY package*.json ./
RUN echo "Current working directory: $(pwd)" && ls -la
RUN npm install
WORKDIR /app/frontend
COPY frontend/. ./
RUN npm install
RUN npm run build
WORKDIR /app
COPY . .
EXPOSE 3000
ENV SERVER_PORT=3000
ENV PUPPETEER_HEADLESS=true
CMD ["npm", "start"]