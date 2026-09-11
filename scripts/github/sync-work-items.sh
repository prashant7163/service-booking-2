#!/usr/bin/env bash
set -Eeuo pipefail

APPROVED_REPOSITORY="https://github.com/prashant7163/service-booking-2.git"
APPROVED_REPOSITORY_WEB="https://github.com/prashant7163/service-booking-2"
REPOSITORY_SLUG="prashant7163/service-booking-2"
PROJECT_ID="service-booking-2"
RUN_ID="service-booking-2-benchmark"

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)
GIT_COMMON_DIR=$(git -C "$ROOT_DIR" rev-parse --path-format=absolute --git-common-dir)
STUDIO_ROOT=$(CDPATH= cd -- "$GIT_COMMON_DIR/.." && pwd -P)
TRACKING_DIR="$ROOT_DIR/docs/project/tracking"
LINKS_FILE="$TRACKING_DIR/github-links.json"
RETRY_FILE="$TRACKING_DIR/sync-retry.json"

OPERATION=${1:-}
EVENT_SEQUENCE=0
ERROR_CLASS="local_validation_failure"
GH_ERROR_FILE=
WORK_DIR=
ERROR_CLASS_FILE=

usage() {
  printf 'usage: %s {register|checkpoint|verify}\n' "${BASH_SOURCE[0]}" >&2
  exit 64
}

case "$OPERATION" in
  register|checkpoint|verify) ;;
  *) usage ;;
esac

mkdir -p "$TRACKING_DIR"
WORK_DIR=$(mktemp -d "${TMPDIR:-/tmp}/service-booking-github-sync.XXXXXX")
GH_ERROR_FILE="$WORK_DIR/gh-error"
ERROR_CLASS_FILE="$WORK_DIR/error-class"

cleanup() {
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

write_retry() {
  local attempt=1 retry_tmp
  trap - ERR
  if [[ -f $RETRY_FILE ]] && jq -e \
    --arg operation "$OPERATION" \
    --argjson sequence "$EVENT_SEQUENCE" \
    '.operation == $operation and .local_event_sequence == $sequence and (.attempt | type == "number")' \
    "$RETRY_FILE" >/dev/null 2>&1; then
    attempt=$(( $(jq -r '.attempt' "$RETRY_FILE") + 1 ))
  fi
  retry_tmp=$(mktemp "$TRACKING_DIR/.sync-retry.XXXXXX")
  jq -n \
    --arg project_id "$PROJECT_ID" \
    --arg run_id "$RUN_ID" \
    --arg repository "$APPROVED_REPOSITORY" \
    --arg operation "$OPERATION" \
    --argjson local_event_sequence "$EVENT_SEQUENCE" \
    --argjson attempt "$attempt" \
    --arg error_class "$ERROR_CLASS" \
    --arg next_command "SERVICE_BOOKING_GITHUB_REPOSITORY=$APPROVED_REPOSITORY scripts/github/sync-work-items.sh $OPERATION" \
    '{schema_version:"1.0.0",project_id:$project_id,run_id:$run_id,repository:$repository,operation:$operation,local_event_sequence:$local_event_sequence,attempt:$attempt,error_class:$error_class,next_command:$next_command}' \
    >"$retry_tmp"
  mv "$retry_tmp" "$RETRY_FILE"
  printf 'GitHub synchronization failed safely (%s); retry details: %s\n' "$ERROR_CLASS" "${RETRY_FILE#"$ROOT_DIR/"}" >&2
}

on_error() {
  local status=$?
  if [[ -s $ERROR_CLASS_FILE ]]; then
    ERROR_CLASS=$(<"$ERROR_CLASS_FILE")
  fi
  write_retry
  exit "$status"
}
trap on_error ERR

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    ERROR_CLASS="missing_dependency"
    return 1
  }
}

set_error_class() {
  ERROR_CLASS=$1
  printf '%s\n' "$1" >"$ERROR_CLASS_FILE"
}

run_gh() {
  local output
  : >"$GH_ERROR_FILE"
  if ! output=$(gh "$@" 2>"$GH_ERROR_FILE"); then
    set_error_class "github_api_failure"
    return 1
  fi
  printf '%s\n' "$output"
}

validate_repository_binding() {
  if [[ ${SERVICE_BOOKING_GITHUB_REPOSITORY:-} != "$APPROVED_REPOSITORY" ]]; then
    set_error_class "repository_mismatch"
    return 1
  fi
  local origin
  origin=$(git -C "$ROOT_DIR" remote get-url origin)
  if [[ $origin != "$APPROVED_REPOSITORY" ]]; then
    set_error_class "repository_mismatch"
    return 1
  fi
}

verify_remote_repository() {
  local identity
  validate_repository_binding
  identity=$(run_gh api "repos/$REPOSITORY_SLUG")
  if ! jq -e \
    --arg slug "$REPOSITORY_SLUG" \
    --arg url "$APPROVED_REPOSITORY_WEB" \
    '.full_name == $slug and .html_url == $url' \
    <<<"$identity" >/dev/null; then
    set_error_class "repository_mismatch"
    return 1
  fi
}

mutate_gh() {
  verify_remote_repository
  run_gh api "$@"
}

clear_retry() {
  local retry_tmp
  retry_tmp=$(mktemp "$TRACKING_DIR/.sync-retry.XXXXXX")
  jq -n \
    --arg project_id "$PROJECT_ID" \
    --arg run_id "$RUN_ID" \
    --arg repository "$APPROVED_REPOSITORY" \
    --argjson local_event_sequence "$EVENT_SEQUENCE" \
    '{schema_version:"1.0.0",project_id:$project_id,run_id:$run_id,repository:$repository,operation:null,local_event_sequence:$local_event_sequence,attempt:0,error_class:null,next_command:null}' \
    >"$retry_tmp"
  mv "$retry_tmp" "$RETRY_FILE"
}

require_command jq
require_command git
require_command gh

STATUS_FILE="$WORK_DIR/studio-status.json"
if ! "$STUDIO_ROOT/studioctl" status >"$STATUS_FILE"; then
  ERROR_CLASS="studio_status_failure"
  false
fi

if ! jq -e \
  --arg project_id "$PROJECT_ID" \
  --arg run_id "$RUN_ID" \
  '.code == "ok" and .state.project_id == $project_id and .state.run_id == $run_id and .state.capability_states["github-project-workflow"] == "active"' \
  "$STATUS_FILE" >/dev/null; then
  ERROR_CLASS="studio_binding_mismatch"
  false
fi
EVENT_SEQUENCE=$(jq -r '.state.last_event_sequence' "$STATUS_FILE")

validate_repository_binding

PLAN_SNAPSHOT=$(jq -r \
  '.state.artifacts | map(select(.kind == "plan" and .subject_id == "service-booking-2-phase-one")) | last | .snapshot_locator // empty' \
  "$STATUS_FILE")
PLAN_DIGEST=$(jq -r \
  '.state.artifacts | map(select(.kind == "plan" and .subject_id == "service-booking-2-phase-one")) | last | .sha256 // empty' \
  "$STATUS_FILE")
if [[ $PLAN_DIGEST != "2c877de39821812f3b1014e83e968511f1474780f65bcc7d21e76433cd627073" || -z $PLAN_SNAPSHOT || ! -f $STUDIO_ROOT/$PLAN_SNAPSHOT ]]; then
  ERROR_CLASS="approved_plan_unavailable"
  false
fi
PLAN_FILE="$STUDIO_ROOT/$PLAN_SNAPSHOT"
if ! jq -e \
  --arg project_id "$PROJECT_ID" \
  --arg run_id "$RUN_ID" \
  '.project_id == $project_id and .run_id == $run_id and .plan_id == "service-booking-2-phase-one" and (.milestones | length == 5)' \
  "$PLAN_FILE" >/dev/null; then
  ERROR_CLASS="approved_plan_mismatch"
  false
fi

milestone_marker() {
  printf '[service-booking-local-id:%s]' "$1"
}

task_marker() {
  printf '[service-booking-local-id:%s]' "$1"
}

milestone_title() {
  local ordinal=$1 milestone_id=$2
  printf '[Service Booking Two] Milestone %s: %s' "$ordinal" "$milestone_id"
}

milestone_description() {
  local milestone_id=$1
  printf '%s\n\nProject ID: `%s`\nMilestone ID: `%s`\n\nThis GitHub milestone is a redacted tracking counterpart. Authoritative state, validation, and approval remain in local Studio records.' \
    "$(milestone_marker "$milestone_id")" "$PROJECT_ID" "$milestone_id"
}

issue_title() {
  local title=$1 task_id=$2
  printf '[Service Booking Two] %s [%s]' "$title" "$task_id"
}

issue_body() {
  local task_id=$1 milestone_id=$2 requirement_ids=$3 acceptance_ids=$4
  printf '%s\n\nProject ID: `%s`\nTask ID: `%s`\nMilestone ID: `%s`\nRequirement IDs: %s\nAcceptance criterion IDs: %s\n\nThis issue is a redacted tracking counterpart. Authoritative task state, evidence, validation, and approval remain in local Studio records.' \
    "$(task_marker "$task_id")" "$PROJECT_ID" "$task_id" "$milestone_id" "$requirement_ids" "$acceptance_ids"
}

validate_milestone_response() {
  local response=$1 milestone_id=$2
  jq -e \
    --arg marker "$(milestone_marker "$milestone_id")" \
    --arg prefix "$APPROVED_REPOSITORY_WEB/milestone/" \
    '(.number | type == "number") and (.html_url | startswith($prefix)) and (.description | contains($marker))' \
    <<<"$response" >/dev/null
}

validate_issue_response() {
  local response=$1 task_id=$2 milestone_number=$3
  jq -e \
    --arg marker "$(task_marker "$task_id")" \
    --arg prefix "$APPROVED_REPOSITORY_WEB/issues/" \
    --argjson milestone_number "$milestone_number" \
    '(.number | type == "number") and (.html_url | startswith($prefix)) and (.body | contains($marker)) and .milestone.number == $milestone_number' \
    <<<"$response" >/dev/null
}

sync_counterparts() {
  local remote_milestones remote_issues milestone_links='{}' task_links='{}'
  remote_milestones=$(run_gh api "repos/$REPOSITORY_SLUG/milestones?state=all&per_page=100" --paginate)
  jq -e 'type == "array"' <<<"$remote_milestones" >/dev/null

  while IFS=$'\t' read -r milestone_id ordinal; do
    local marker title description matches match_count response number url
    marker=$(milestone_marker "$milestone_id")
    title=$(milestone_title "$ordinal" "$milestone_id")
    description=$(milestone_description "$milestone_id")
    matches=$(jq --arg marker "$marker" '[.[] | select((.description // "") | contains($marker))]' <<<"$remote_milestones")
    match_count=$(jq 'length' <<<"$matches")
    if ((match_count > 1)); then
      ERROR_CLASS="ambiguous_remote_counterpart"
      return 1
    elif ((match_count == 0)); then
      response=$(mutate_gh "repos/$REPOSITORY_SLUG/milestones" -X POST -f "title=$title" -f "description=$description")
      remote_milestones=$(jq --argjson response "$response" '. + [$response]' <<<"$remote_milestones")
    else
      number=$(jq -r '.[0].number' <<<"$matches")
      response=$(mutate_gh "repos/$REPOSITORY_SLUG/milestones/$number" -X PATCH -f "title=$title" -f "description=$description")
      remote_milestones=$(jq --argjson number "$number" --argjson response "$response" 'map(if .number == $number then $response else . end)' <<<"$remote_milestones")
    fi
    validate_milestone_response "$response" "$milestone_id"
    number=$(jq -r '.number' <<<"$response")
    url=$(jq -r '.html_url' <<<"$response")
    milestone_links=$(jq \
      --arg id "$milestone_id" --arg url "$url" --argjson number "$number" \
      '. + {($id): {number:$number,url:$url}}' <<<"$milestone_links")
  done < <(jq -r '.milestones | sort_by(.ordinal)[] | [.milestone_id, (.ordinal|tostring)] | @tsv' "$PLAN_FILE")

  remote_issues=$(run_gh api "repos/$REPOSITORY_SLUG/issues?state=all&per_page=100" --paginate)
  jq -e 'type == "array"' <<<"$remote_issues" >/dev/null

  while IFS=$'\t' read -r task_id title milestone_id requirement_ids acceptance_ids; do
    local marker body matches match_count response number url milestone_number
    marker=$(task_marker "$task_id")
    milestone_number=$(jq -r --arg id "$milestone_id" '.[$id].number' <<<"$milestone_links")
    body=$(issue_body "$task_id" "$milestone_id" "$requirement_ids" "$acceptance_ids")
    title=$(issue_title "$title" "$task_id")
    matches=$(jq --arg marker "$marker" '[.[] | select(has("pull_request") | not) | select((.body // "") | contains($marker))]' <<<"$remote_issues")
    match_count=$(jq 'length' <<<"$matches")
    if ((match_count > 1)); then
      ERROR_CLASS="ambiguous_remote_counterpart"
      return 1
    elif ((match_count == 0)); then
      response=$(mutate_gh "repos/$REPOSITORY_SLUG/issues" -X POST -f "title=$title" -f "body=$body" -f "milestone=$milestone_number")
      remote_issues=$(jq --argjson response "$response" '. + [$response]' <<<"$remote_issues")
    else
      number=$(jq -r '.[0].number' <<<"$matches")
      response=$(mutate_gh "repos/$REPOSITORY_SLUG/issues/$number" -X PATCH -f "title=$title" -f "body=$body" -f "milestone=$milestone_number")
      remote_issues=$(jq --argjson number "$number" --argjson response "$response" 'map(if .number == $number then $response else . end)' <<<"$remote_issues")
    fi
    validate_issue_response "$response" "$task_id" "$milestone_number"
    number=$(jq -r '.number' <<<"$response")
    url=$(jq -r '.html_url' <<<"$response")
    task_links=$(jq \
      --arg id "$task_id" --arg milestone_id "$milestone_id" --arg url "$url" --argjson number "$number" \
      '. + {($id): {number:$number,url:$url,milestone_id:$milestone_id}}' <<<"$task_links")
  done < <(jq -r '.milestones[] as $milestone | $milestone.tasks[] | select(.kind == "implementation") | [.task_id,.title,$milestone.milestone_id,(.requirement_ids|join(", ")),( .acceptance_criterion_ids|join(", "))] | @tsv' "$PLAN_FILE")

  local links_tmp
  links_tmp=$(mktemp "$TRACKING_DIR/.github-links.XXXXXX")
  jq -n \
    --arg project_id "$PROJECT_ID" \
    --arg run_id "$RUN_ID" \
    --arg repository "$APPROVED_REPOSITORY" \
    --argjson sequence "$EVENT_SEQUENCE" \
    --argjson milestones "$milestone_links" \
    --argjson tasks "$task_links" \
    '{schema_version:"1.0.0",project_id:$project_id,run_id:$run_id,repository:$repository,last_local_event_sequence:$sequence,milestones:$milestones,tasks:$tasks}' \
    >"$links_tmp"
  mv "$links_tmp" "$LINKS_FILE"
}

verify_counterparts() {
  [[ -f $LINKS_FILE ]] || {
    ERROR_CLASS="local_links_unavailable"
    return 1
  }
  jq -e \
    --arg project_id "$PROJECT_ID" \
    --arg run_id "$RUN_ID" \
    --arg repository "$APPROVED_REPOSITORY" \
    '.project_id == $project_id and .run_id == $run_id and .repository == $repository and (.milestones | length == 5) and (.tasks | length == 11)' \
    "$LINKS_FILE" >/dev/null

  local remote_milestones remote_issues
  remote_milestones=$(run_gh api "repos/$REPOSITORY_SLUG/milestones?state=all&per_page=100" --paginate)
  remote_issues=$(run_gh api "repos/$REPOSITORY_SLUG/issues?state=all&per_page=100" --paginate)

  while IFS=$'\t' read -r milestone_id number url; do
    jq -e \
      --arg marker "$(milestone_marker "$milestone_id")" \
      --argjson number "$number" \
      --arg url "$url" \
      '[.[] | select(.number == $number and .html_url == $url and ((.description // "") | contains($marker)))] | length == 1' \
      <<<"$remote_milestones" >/dev/null
  done < <(jq -r '.milestones | to_entries[] | [.key,(.value.number|tostring),.value.url] | @tsv' "$LINKS_FILE")

  while IFS=$'\t' read -r task_id number url milestone_id; do
    local milestone_number
    milestone_number=$(jq -r --arg id "$milestone_id" '.milestones[$id].number' "$LINKS_FILE")
    jq -e \
      --arg marker "$(task_marker "$task_id")" \
      --argjson number "$number" \
      --arg url "$url" \
      --argjson milestone_number "$milestone_number" \
      '[.[] | select(has("pull_request") | not) | select(.number == $number and .html_url == $url and .milestone.number == $milestone_number and ((.body // "") | contains($marker)))] | length == 1' \
      <<<"$remote_issues" >/dev/null
  done < <(jq -r '.tasks | to_entries[] | [.key,(.value.number|tostring),.value.url,.value.milestone_id] | @tsv' "$LINKS_FILE")
}

case "$OPERATION" in
  register|checkpoint)
    sync_counterparts
    ;;
  verify)
    verify_counterparts
    ;;
esac

clear_retry
printf 'GitHub synchronization %s succeeded at local event sequence %s\n' "$OPERATION" "$EVENT_SEQUENCE"
