#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.production.yml"

API_URL="${API_URL:-https://api-frater.cx-tech.net}"
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-Back-Geral}"
DEPLOY_REMOTE_DIR="${DEPLOY_REMOTE_DIR:-projetos/frater_fotos}"
RUN_REMOTE_DEPLOY="${RUN_REMOTE_DEPLOY:-true}"
REGISTRY_HOST="${REGISTRY_HOST:-registry.gitlab.com}"
REGISTRY_USER="${REGISTRY_USER:-${GITLAB_REGISTRY_USER:-${CI_REGISTRY_USER:-}}}"
REGISTRY_PASSWORD="${REGISTRY_PASSWORD:-${GITLAB_REGISTRY_TOKEN:-${CI_REGISTRY_PASSWORD:-}}}"
GITLAB_API_URL="${GITLAB_API_URL:-https://gitlab.com/api/v4}"
GITLAB_PROJECT_ID="${GITLAB_PROJECT_ID:-cxtech%2Ffrater_fotos}"
GITLAB_API_TOKEN="${GITLAB_API_TOKEN:-${CI_GITLAB_API_TOKEN:-}}"
REGISTRY_CLEANUP_LATEST="${REGISTRY_CLEANUP_LATEST:-true}"
COMPOSE_FILE="${COMPOSE_FILE:-${DEFAULT_COMPOSE_FILE}}"
DEPLOY_TARGET="${DEPLOY_TARGET:-auto}"
APP_REPO="registry.gitlab.com/cxtech/frater_fotos/api"
FRONT_REPO="registry.gitlab.com/cxtech/frater_fotos/front"
APP_IMAGE="${APP_REPO}:prod"
APP_PREV_IMAGE="${APP_REPO}:prod-prev"
FRONT_IMAGE="${FRONT_REPO}:prod"
FRONT_PREV_IMAGE="${FRONT_REPO}:prod-prev"
APP_PREV_AVAILABLE=false
FRONT_PREV_AVAILABLE=false
DEPLOY_APP=false
DEPLOY_FRONT=false
CHANGED_FILES_CACHE=""

log() {
  echo
  echo "==> $1"
}

login_registry() {
  if [ -n "${REGISTRY_USER}" ] && [ -n "${REGISTRY_PASSWORD}" ]; then
    log "Logging in to ${REGISTRY_HOST}"
    printf '%s' "${REGISTRY_PASSWORD}" | docker login "${REGISTRY_HOST}" -u "${REGISTRY_USER}" --password-stdin
    return
  fi

  log "No registry credentials provided via env; using current docker session"
}

promote_previous_image() {
  local current_image="$1"
  local previous_image="$2"
  local label="$3"

  log "Preserving previous ${label} image"
  if docker pull "${current_image}"; then
    docker tag "${current_image}" "${previous_image}"
    docker push "${previous_image}"
    if [ "${label}" = "app" ]; then
      APP_PREV_AVAILABLE=true
    else
      FRONT_PREV_AVAILABLE=true
    fi
  else
    log "No existing ${label} production image found; skipping ${previous_image}"
  fi
}

remote_compose() {
  local app_image="$1"
  local front_image="$2"
  local command="$3"

  ssh "${DEPLOY_SSH_HOST}" \
    "cd '${DEPLOY_REMOTE_DIR}' && APP_IMAGE='${app_image}' FRONT_IMAGE='${front_image}' docker compose ${command}"
}

cleanup_local_legacy_tag() {
  local repo="$1"
  docker image rm "${repo}:latest" >/dev/null 2>&1 || true
}

cleanup_remote_legacy_tag() {
  local repo="$1"
  if [ "${RUN_REMOTE_DEPLOY}" != "true" ]; then
    return
  fi
  ssh "${DEPLOY_SSH_HOST}" "docker image rm '${repo}:latest' >/dev/null 2>&1 || true" || true
}

resolve_registry_repository_id() {
  local repo_path="$1"
  curl --silent --show-error --fail \
    --header "PRIVATE-TOKEN: ${GITLAB_API_TOKEN}" \
    "${GITLAB_API_URL}/projects/${GITLAB_PROJECT_ID}/registry/repositories" |
    python3 -c 'import json, sys; repo = sys.argv[1]; data = json.load(sys.stdin); print(next((str(item["id"]) for item in data if item.get("location") == repo), ""))' "${repo_path}"
}

cleanup_registry_legacy_tag() {
  local repo_path="$1"
  local repository_id

  if [ "${REGISTRY_CLEANUP_LATEST}" != "true" ] || [ -z "${GITLAB_API_TOKEN}" ]; then
    return
  fi

  repository_id="$(resolve_registry_repository_id "${repo_path}" || true)"
  if [ -z "${repository_id}" ]; then
    return
  fi

  curl --silent --show-error --fail \
    --request DELETE \
    --header "PRIVATE-TOKEN: ${GITLAB_API_TOKEN}" \
    "${GITLAB_API_URL}/projects/${GITLAB_PROJECT_ID}/registry/repositories/${repository_id}/tags/latest" >/dev/null || true
}

cleanup_legacy_latest_tags() {
  if [ "${DEPLOY_APP}" = "true" ]; then
    cleanup_local_legacy_tag "${APP_REPO}"
    cleanup_remote_legacy_tag "${APP_REPO}"
    cleanup_registry_legacy_tag "${APP_REPO}"
  fi

  if [ "${DEPLOY_FRONT}" = "true" ]; then
    cleanup_local_legacy_tag "${FRONT_REPO}"
    cleanup_remote_legacy_tag "${FRONT_REPO}"
    cleanup_registry_legacy_tag "${FRONT_REPO}"
  fi
}

changed_files() {
  if [ -z "${CHANGED_FILES_CACHE}" ]; then
    CHANGED_FILES_CACHE="$(collect_changed_files || true)"
  fi
  printf '%s\n' "${CHANGED_FILES_CACHE}"
}

collect_changed_files() {
  local tracked=""
  local untracked=""
  local last_commit=""

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    return
  fi

  tracked="$(git diff --name-only HEAD 2>/dev/null || true)"
  untracked="$(git ls-files --others --exclude-standard 2>/dev/null || true)"

  if [ -n "${tracked}${untracked}" ]; then
    printf '%s\n%s\n' "${tracked}" "${untracked}" | sed '/^$/d'
    return
  fi

  if git rev-parse --verify HEAD >/dev/null 2>&1; then
    last_commit="$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null || true)"
    printf '%s\n' "${last_commit}" | sed '/^$/d'
  fi
}

set_deploy_targets() {
  local current_changed_files

  case "${DEPLOY_TARGET}" in
    app)
      DEPLOY_APP=true
      ;;
    front)
      DEPLOY_FRONT=true
      ;;
    all)
      DEPLOY_APP=true
      DEPLOY_FRONT=true
      ;;
    auto)
      current_changed_files="$(changed_files)"
      if [ -z "${current_changed_files}" ]; then
        DEPLOY_APP=true
        DEPLOY_FRONT=true
        return
      fi

      if printf '%s\n' "${current_changed_files}" | grep -Eq '^(back/|docker-compose|deploy-gitlab\.sh|back\.|package-lock\.json$)'; then
        DEPLOY_APP=true
      fi

      if printf '%s\n' "${current_changed_files}" | grep -Eq '^(front/|docker-compose|deploy-gitlab\.sh|front\.|package-lock\.json$)'; then
        DEPLOY_FRONT=true
      fi

      if [ "${DEPLOY_APP}" != "true" ] && [ "${DEPLOY_FRONT}" != "true" ]; then
        DEPLOY_APP=true
        DEPLOY_FRONT=true
      fi
      ;;
    *)
      echo "Invalid DEPLOY_TARGET: ${DEPLOY_TARGET}. Use auto, app, front or all." >&2
      exit 1
      ;;
  esac
}

current_app_image() {
  if [ "${DEPLOY_APP}" = "true" ]; then
    printf '%s' "${APP_IMAGE}"
  else
    printf '%s' "${APP_PREV_IMAGE}"
  fi
}

current_front_image() {
  if [ "${DEPLOY_FRONT}" = "true" ]; then
    printf '%s' "${FRONT_IMAGE}"
  else
    printf '%s' "${FRONT_PREV_IMAGE}"
  fi
}

sync_remote_compose_file() {
  log "Syncing compose file to ${DEPLOY_SSH_HOST}:${DEPLOY_REMOTE_DIR}/docker-compose.yml"
  ssh "${DEPLOY_SSH_HOST}" "mkdir -p '${DEPLOY_REMOTE_DIR}'"
  scp "${COMPOSE_FILE}" "${DEPLOY_SSH_HOST}:${DEPLOY_REMOTE_DIR}/docker-compose.yml"
}

restart_remote_services() {
  local services=()

  if [ "${DEPLOY_APP}" = "true" ]; then
    services+=("app")
  fi

  if [ "${DEPLOY_FRONT}" = "true" ]; then
    services+=("front")
  fi

  log "Pulling updated images for: ${services[*]}"
  remote_compose "${APP_IMAGE}" "${FRONT_IMAGE}" "pull ${services[*]}"

  log "Restarting services: ${services[*]}"
  remote_compose "${APP_IMAGE}" "${FRONT_IMAGE}" "up -d ${services[*]}"
}

wait_for_remote_service() {
  local service="$1"
  local check="$2"
  local healthy=false

  log "Waiting for ${service} to respond..."
  for _ in $(seq 1 12); do
    sleep 5
    if ssh "${DEPLOY_SSH_HOST}" "cd '${DEPLOY_REMOTE_DIR}' && docker compose exec -T ${service} ${check}" >/dev/null 2>&1; then
      healthy=true
      log "${service} responded successfully"
      break
    fi
  done

  if [ "${healthy}" != "true" ]; then
    return 1
  fi
}

verify_remote_services() {
  if [ "${DEPLOY_APP}" = "true" ]; then
    wait_for_remote_service "app" "node -e \"fetch('http://127.0.0.1:3003/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))\"" || return 1
  fi

  if [ "${DEPLOY_FRONT}" = "true" ]; then
    wait_for_remote_service "front" "wget -qO- http://127.0.0.1:80/ || exit 1" || return 1
  fi
}

rollback_remote_services() {
  local rollback_app_image="${APP_IMAGE}"
  local rollback_front_image="${FRONT_IMAGE}"
  local services=()

  if [ "${DEPLOY_APP}" = "true" ]; then
    if [ "${APP_PREV_AVAILABLE}" != "true" ]; then
      log "Previous app image unavailable; skipping app rollback"
    else
      rollback_app_image="${APP_PREV_IMAGE}"
      services+=("app")
    fi
  fi

  if [ "${DEPLOY_FRONT}" = "true" ]; then
    if [ "${FRONT_PREV_AVAILABLE}" != "true" ]; then
      log "Previous front image unavailable; skipping front rollback"
    else
      rollback_front_image="${FRONT_PREV_IMAGE}"
      services+=("front")
    fi
  fi

  if [ ${#services[@]} -eq 0 ]; then
    return
  fi

  remote_compose "${rollback_app_image}" "${rollback_front_image}" "pull ${services[*]}" || true
  remote_compose "${rollback_app_image}" "${rollback_front_image}" "up -d ${services[*]}" || true
}

build_and_push_images() {
  if [ "${DEPLOY_APP}" = "true" ]; then
    promote_previous_image "${APP_IMAGE}" "${APP_PREV_IMAGE}" "app"

    log "Building app image"
    docker build -t "${APP_IMAGE}" ./back

    log "Pushing app image"
    docker push "${APP_IMAGE}"
  fi

  if [ "${DEPLOY_FRONT}" = "true" ]; then
    promote_previous_image "${FRONT_IMAGE}" "${FRONT_PREV_IMAGE}" "front"

    log "Building front image"
    docker build \
      --build-arg VITE_API_URL="${API_URL}" \
      -t "${FRONT_IMAGE}" ./front

    log "Pushing front image"
    docker push "${FRONT_IMAGE}"
  fi
}

if [ ! -f "${COMPOSE_FILE}" ]; then
  echo "Compose file not found: ${COMPOSE_FILE}" >&2
  exit 1
fi

cd "${SCRIPT_DIR}"

set_deploy_targets

log "Deploy target: ${DEPLOY_TARGET} (app=${DEPLOY_APP}, front=${DEPLOY_FRONT})"

login_registry
build_and_push_images

if [ "${RUN_REMOTE_DEPLOY}" = "true" ]; then
  sync_remote_compose_file
  restart_remote_services

  if ! verify_remote_services; then
    log "DEPLOY FAILED — restoring previous production images"
    if [ "${DEPLOY_APP}" = "true" ]; then
      remote_compose "${APP_IMAGE}" "${FRONT_IMAGE}" "logs app --tail 20" || true
    fi
    if [ "${DEPLOY_FRONT}" = "true" ]; then
      remote_compose "${APP_IMAGE}" "${FRONT_IMAGE}" "logs front --tail 20" || true
    fi

    rollback_remote_services
    exit 1
  fi

  cleanup_legacy_latest_tags
fi
