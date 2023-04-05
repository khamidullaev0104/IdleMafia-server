#!/bin/bash

SERVER_DIR=/home/gangwars/www/server
CLIENT_DIR=/home/gangwars/www/client

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$SCRIPT_DIR/../output.sh"

if (( $(which node | wc -l) == "0" )); then 
  print_error "Node not found, exited"
fi

NODE_VERSION="$(node -v)"
NPM_BIN="/usr/local/nvm/versions/node/""$NODE_VERSION""/bin/npm"

function update_src {
  git reset --quiet --hard HEAD~5
  git pull --quiet origin main
}

function install_modules {
  $NPM_BIN i
}

function deploy_server {
  print_title "Deploying server..."

  cd "$SERVER_DIR"
  print_info "Updating sources..."
  update_src
  print_info "Installing modules..."
  install_modules
  print_info "Node process restarting..."
  PM2_PROCESS_NAME="localhost:4000"
  pm2 delete "$PM2_PROCESS_NAME"
  pm2 start ./server.js --name "$PM2_PROCESS_NAME"
  print_title "Server deployed successfully"
}

function deploy_client {
  print_title "Deploying client..." 

  cd "$CLIENT_DIR"
  print_info "Updating sources..."
  update_src
  print_info "Installing modules..."
  install_modules
  print_info "Building application..."
  $NPM_BIN run build
  print_title "Client deployed successfully"
}

deploy_server
deploy_client
