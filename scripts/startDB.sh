#!/usr/bin/env bash

# Current directory
current_dir=$(pwd)

# Current user
current_user=$(whoami)

mariadbd-safe --datadir="$current_dir/.tmp/db" --user=$current_user --socket="$current_dir/.tmp/socket_db"