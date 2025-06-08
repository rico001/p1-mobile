FROM node:20.9.0

# OpenSSL installieren  für Bambu Certificate Download
RUN apt-get update && \
    apt-get install -y \
      iputils-ping \
      openssl && \
    rm -rf /var/lib/apt/lists/*

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

RUN chmod +x ./get-cert.sh
RUN npm run build
EXPOSE 3000
ENV SERVER_PORT=3000
CMD ["npm", "start"]