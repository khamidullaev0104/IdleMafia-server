#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$SCRIPT_DIR/../output.sh"

print_title "Stopping containers..."
docker compose stop

print_title "Prunning..."
docker system prune -f

print_title "Removing volumes..."
docker volume prune -f
