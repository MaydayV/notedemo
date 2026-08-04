#!/bin/bash
# Load env from .env file in the same directory as this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
set -a
source "$SCRIPT_DIR/.env"
set +a
exec node "$SCRIPT_DIR/server.js"
