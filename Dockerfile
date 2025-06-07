FROM node:20.9.0

# ✅ PING installieren (für ICMP im OfflineDetectionService)
RUN apt-get update && apt-get install -y iputils-ping

# App-Setup
WORKDIR /app
COPY package*.json ./
RUN echo "Current working directory: $(pwd)" && ls -la
RUN npm install

# Frontend-Setup
WORKDIR /app/frontend
COPY frontend/. ./
RUN npm install
RUN npm run build

# Backend-Setup
WORKDIR /app
COPY . .

# ⬇️ Backend TypeScript kompilieren
RUN npm run build
EXPOSE 3000
ENV SERVER_PORT=3000
CMD ["npm", "start"]