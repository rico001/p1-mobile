#!/usr/bin/env bash
set -e

# .env laden, falls vorhanden
if [ -f .env ]; then
  # ignore comments, export alle anderen Zeilen
  set -a
  source .env
  set +a
fi

# IP aus Argument oder ENV
if [ -n "$1" ]; then
  IP="$1"
elif [ -n "$PRINTER_IP" ]; then
  IP="$PRINTER_IP"
else
  echo "Usage: $0 <IP> or set PRINTER_IP" >&2
  exit 1
fi

mkdir -p ./cert
openssl s_client -connect "${IP}:990" -showcerts </dev/null \
  | sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p'
  > ./cert/blcert.pem

echo "✔ Zertifikat von $IP in ./cert/blcert.pem gespeichert"
