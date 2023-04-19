#!/bin/bash
source "../../output.sh"


print_info "save new points data"
curl --location '127.0.0.1:4000/getPoint' --request POST --header 'Content-Type: application/json'
