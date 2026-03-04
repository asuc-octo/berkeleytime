#!/usr/bin/env bash

set -euo pipefail

SEED_DB=true
NO_DOCKER=false

usage() {
  cat <<'EOF'
Bootstrap Berkeleytime local development.

Usage:
  ./scripts/bootstrap-local.sh [options]

Options:
  --no-seed-db     Do not seed the database.
  --no-docker      Skip starting Docker services (still installs deps + generates types).
  -h, --help       Show this help.

Notes:
  - This script is intended for macOS and Linux/WSL.
  - It will NOT overwrite an existing .env.
EOF
}

log() { printf '%s\n' "$*"; }
step() { printf '\n==> %s\n' "$*"; }
warn() { printf '\nWARN: %s\n' "$*" >&2; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }

require_cmd() {
  local cmd="$1"
  local hint="${2:-}"
  if ! have "$cmd"; then
    if [[ -n "$hint" ]]; then
      die "Missing required command: $cmd. $hint"
    fi
    die "Missing required command: $cmd"
  fi
}

ensure_repo_root() {
  [[ -f "package.json" ]] || die "Run this from the repo root (missing package.json)."
  [[ -f "docker-compose.yml" ]] || die "Run this from the repo root (missing docker-compose.yml)."
  [[ -d "apps" && -d "packages" ]] || die "Run this from the repo root (missing apps/ or packages/)."
}

detect_compose_cmd() {
  if have docker && docker compose version >/dev/null 2>&1; then
    echo "docker compose"
    return 0
  fi
  if have docker-compose; then
    echo "docker-compose"
    return 0
  fi
  return 1
}

source_nvm_if_possible() {
  if have nvm; then
    return 0
  fi

  local nvm_dir="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$nvm_dir/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    . "$nvm_dir/nvm.sh"
  fi
}

setup_node() {
  step "Setting up Node"

  source_nvm_if_possible

  if have nvm; then
    # nvm sometimes needs TMPDIR set explicitly in constrained environments
    export TMPDIR="${TMPDIR:-/tmp}"
    if ! nvm install --lts; then
      warn "nvm install --lts failed. Ensure your nvm installation is healthy or install Node manually (>= 22.12.0)."
    else
      nvm use --lts || warn "nvm use --lts failed; falling back to existing node on PATH."
    fi
  fi

  require_cmd node "Install Node.js >= 22.12.0 (recommended: via nvm), then re-run."
  require_cmd npm "Install npm >= 10, then re-run."
}

ensure_env_file() {
  step "Ensuring .env exists"
  if [[ -f ".env" ]]; then
    log ".env already exists; leaving it unchanged."
    return 0
  fi
  [[ -f ".env.template" ]] || die "Missing .env.template"
  cp .env.template .env
  log "Created .env from .env.template"
}

setup_repo_deps() {
  step "Installing repo dependencies"

  if have pre-commit; then
    pre-commit install || warn "pre-commit install failed; you can re-run it later."
  else
    warn "pre-commit is not installed. Suggested installs:"
    warn "  macOS (brew): brew install pre-commit"
    warn "  pip: pip install pre-commit"
  fi

  npm install
  npx turbo run generate
}

ensure_docker_running() {
  require_cmd docker "Install Docker Desktop / Docker Engine, then re-run."
  docker info >/dev/null 2>&1 || die "Docker doesn't seem to be running. Start Docker Desktop (or the Docker daemon) and re-run."

  local compose_cmd
  compose_cmd="$(detect_compose_cmd)" || die "Docker Compose not found. Install Docker Desktop or docker-compose, then re-run."
  echo "$compose_cmd"
}

start_services() {
  local compose_cmd="$1"
  step "Starting services with Docker Compose"
  $compose_cmd up -d
}

backup_date_string() {
  # Match docs: TZ=America/Los_Angeles date -v -6H +%Y%m%d (macOS)
  # GNU date fallback: TZ=America/Los_Angeles date -d '6 hours ago' +%Y%m%d (Linux)
  if TZ=America/Los_Angeles date -v -6H +%Y%m%d >/dev/null 2>&1; then
    TZ=America/Los_Angeles date -v -6H +%Y%m%d
    return 0
  fi
  if TZ=America/Los_Angeles date -d '6 hours ago' +%Y%m%d >/dev/null 2>&1; then
    TZ=America/Los_Angeles date -d '6 hours ago' +%Y%m%d
    return 0
  fi
  return 1
}

seed_database() {
  step "Seeding local MongoDB"
  require_cmd curl "Install curl, then re-run."

  local date_str
  date_str="$(backup_date_string)" || die "Unable to compute backup date string (date command unsupported)."

  local backup_file="prod-backup.gz"
  local backup_url="https://backups.berkeleytime.com/daily/prod_public_backup-${date_str}.gz"

  log "Downloading ${backup_url}"
  curl -fL -o "$backup_file" "$backup_url"

  local compose_cmd
  compose_cmd="$(detect_compose_cmd)" || die "Docker Compose not found."

  local mongo_container_id
  mongo_container_id="$($compose_cmd ps -q mongodb)"
  [[ -n "$mongo_container_id" ]] || die "MongoDB container not found. Is Docker Compose running?"

  docker cp "./$backup_file" "${mongo_container_id}:/tmp/prod-backup.gz"
  docker exec "$mongo_container_id" mongorestore --drop --gzip --archive=/tmp/prod-backup.gz
  log "MongoDB restore complete."
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --no-seed-db) SEED_DB=false; shift ;;
      --no-docker) NO_DOCKER=true; SEED_DB=false; shift ;;
      -h|--help) usage; exit 0 ;;
      *)
        die "Unknown argument: $1 (run --help)"
        ;;
    esac
  done
}

main() {
  parse_args "$@"
  ensure_repo_root

  step "Checking prerequisites"
  require_cmd git "Install Git, then re-run."
  require_cmd curl "Install curl, then re-run."

  setup_node
  ensure_env_file
  setup_repo_deps

  if [[ "$NO_DOCKER" == "true" ]]; then
    warn "Skipping Docker services (--no-docker)."
  else
    local compose_cmd
    step "Checking Docker"
    compose_cmd="$(ensure_docker_running)"
    start_services "$compose_cmd"
  fi

  if [[ "$SEED_DB" == "true" ]]; then
    seed_database
  fi

  step "Done"
  log "Visit: http://localhost:3000"
  log "If you changed GraphQL typedefs later, re-run: npx turbo run generate"
  log "To rebuild Docker after adding dependencies: docker compose up --build -d"
}

main "$@"
