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

function check_node_status {
  print_info "Checking node status..."
  if (( $(pm2 prettylist | grep -e "restart_time:\s*0" | wc -l) != 1 ));then 
    print_error "Node deployment error" 
  else 
    print_info "Node updated successfully"
  fi
}

function check_client_status {
  print_info "Checking client status..."
  if (( $(curl -sSIL "https://gangwarsai.solvve.com" | grep "HTTP/1.1 200" | wc -l) == 0 ));then
    print_error "Client deployment error"
  else
    print_info "Client updated successfully"
  fi
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
  print_info "Removing previous application version..."
  rm -rf build
  print_info "Building application..."
  $NPM_BIN run build
  print_title "Client deployed successfully"
}

deploy_server
deploy_client

check_node_status
check_client_status