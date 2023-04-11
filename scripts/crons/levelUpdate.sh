#!/bin/bash
source "../output.sh"
CRONS_DIR=../../crons

print_title "Level date update"
node "$CRONS_DIR/levelParse.js"

print_info "search for new capos"
node "$CRONS_DIR/capoParse.js"

print_info "save capos name"
node "$CRONS_DIR/capoSaveToLevelSchema.js"
