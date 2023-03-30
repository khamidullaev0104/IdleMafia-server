#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$SCRIPT_DIR/../output.sh"

bash "$SCRIPT_DIR/stop.sh"

print_title "Starting containers"
docker compose up -d
