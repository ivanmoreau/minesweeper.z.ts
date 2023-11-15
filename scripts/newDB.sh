#!/usr/bin/env bash

# Current directory
current_dir=$(pwd)

# Current user
current_user=$(whoami)

# Create a new database
mkdir -p "$current_dir/.tmp/db"
mysql_install_db --user=$current_user --datadir="$current_dir/.tmp/db"