#!/bin/bash
# set crontab to run this script every 5 minutes on docker host
# chmod +x /home/ubuntu/mjpg-docker/check-cams.sh
# */1 * * * * /home/ubuntu/mjpg-docker/check-cams.sh

# Kameraendpunkte
CAM1_URL="http://192.168.178.52:8080/?action=snapshot"
CAM2_URL="http://192.168.178.52:8081/?action=snapshot"

# Container-Namen
CAM1_CONTAINER="mjpg-streamer-0"
CAM2_CONTAINER="mjpg-streamer-1"

# Log-Dateipfad
LOGFILE="/home/ubuntu/mjpg-docker/watchdog.log"

# Funktion zum Prüfen und ggf. Neustarten
check_and_restart() {
  local url="$1"
  local container="$2"

  if ! curl -s --max-time 5 "$url" > /dev/null; then
    echo "[$(date)] FEHLER bei $url – Container $container wird neu gestartet" | tee -a "$LOGFILE"
    docker restart "$container"
  fi
}

# Hauptfunktion
main() {
  check_and_restart "$CAM1_URL" "$CAM1_CONTAINER"
  check_and_restart "$CAM2_URL" "$CAM2_CONTAINER"
}

main