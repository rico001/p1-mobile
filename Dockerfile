# Verwenden Sie ein Basis-Image mit Node.js
#docker build -t bambu-http-proxy:latest .
FROM node:20.9.0

# Erstellen Sie ein Arbeitsverzeichnis für Ihre App
WORKDIR /app

# Kopieren Sie die Dateien package.json und package-lock.json im Root-Verzeichnis
COPY package*.json ./

# Installieren Sie Server-Abhängigkeiten im Root-Verzeichnis
RUN npm install

# Wechseln Sie zum Verzeichnis "app/"
WORKDIR /app/app

# Kopieren Sie die Dateien package.json und package-lock.json im Verzeichnis "app/"
COPY frontend/. ./

# Installieren Sie Abhängigkeiten für die React-App im Verzeichnis "app/"
RUN npm install

# app bauen
RUN npm run build

# Wechseln Sie zurück zum Root-Verzeichnis
WORKDIR /app

# Kopieren Sie den Rest der Anwendung in das Arbeitsverzeichnis
COPY . .
# Port, den Ihre Anwendung hören soll
EXPOSE 3000

# Setzen Sie Umgebungsvariablen
ENV SERVER_PORT=3000
ENV PUPPETEER_HEADLESS=true


# Starten Sie Ihre Anwendung
CMD ["npm", "start"]