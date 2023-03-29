#!/usr/bin/env bash
#http://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux#answer-5947802
NC='\033[0m' # No Color

RED='\033[0;31m'
LightBlue='\033[1;34m'
Yellow='\033[1;33m'
White='\033[1;37m'
LightGreen='\033[1;32m'
LightGray='\033[0;37m'
DarkGray='\033[1;30m'

# @param $1 text
print_info () {
    printf "${LightBlue}[INFO]${NC} $1\n"
}

# @param $1 text
print_regular () {
    echo -e "$1"
}

# @param $1 text
print_error () {
    printf "${RED}[ERROR]${NC} $1\n"
    exit 1
}

# @param $1 text
print_warn () {
    printf "${LightBlue}[WARN]${NC} $1\n"
}

# @param $1 text
print_title () {
  echo -e " "
  printf "${LightGreen}--> $1${NC} | $(date +%H:%M)\n"
  echo -e " "
}


# @param $1 text
print_title () {
  echo -e " "
  printf "${LightGreen}--> $1${NC} | $(date +%H:%M)\n"
  echo -e " "
}