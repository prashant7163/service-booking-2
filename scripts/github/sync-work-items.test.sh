#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)
SYNC_SCRIPT="$ROOT_DIR/scripts/github/sync-work-items.sh"
LINKS_FILE="$ROOT_DIR/docs/project/tracking/github-links.json"
RETRY_FILE="$ROOT_DIR/docs/project/tracking/sync-retry.json"
APPROVED_REPOSITORY="https://github.com/prashant7163/service-booking-2.git"

TEST_DIR=$(mktemp -d)
cp "$LINKS_FILE" "$TEST_DIR/github-links.before.json"
cp "$RETRY_FILE" "$TEST_DIR/sync-retry.before.json"
cleanup() {
  cp "$TEST_DIR/github-links.before.json" "$LINKS_FILE"
  cp "$TEST_DIR/sync-retry.before.json" "$RETRY_FILE"
  rm -rf "$TEST_DIR"
}
trap cleanup EXIT
mkdir -p "$TEST_DIR/bin"

export FAKE_GH_STATE="$TEST_DIR/github-state.json"
export FAKE_GH_LOG="$TEST_DIR/github-calls.log"
printf '%s\n' '{"milestones":[],"issues":[]}' >"$FAKE_GH_STATE"
: >"$FAKE_GH_LOG"

cat >"$TEST_DIR/bin/gh" <<'FAKE_GH'
#!/usr/bin/env bash
set -euo pipefail

if [[ ${1:-} != api ]]; then
  exit 64
fi
shift

method=GET
endpoint=
fields=()
while (($#)); do
  case "$1" in
    -X)
      method=$2
      shift 2
      ;;
    -f)
      fields+=("$2")
      shift 2
      ;;
    --paginate)
      shift
      ;;
    *)
      if [[ -z $endpoint ]]; then
        endpoint=$1
      fi
      shift
      ;;
  esac
done

printf '%s %s\n' "$method" "$endpoint" >>"$FAKE_GH_LOG"

field() {
  local wanted=$1 entry
  for entry in "${fields[@]}"; do
    if [[ ${entry%%=*} == "$wanted" ]]; then
      printf '%s' "${entry#*=}"
      return 0
    fi
  done
  return 1
}

case "$method:$endpoint" in
  GET:repos/prashant7163/service-booking-2)
    printf '%s\n' '{"full_name":"prashant7163/service-booking-2","html_url":"https://github.com/prashant7163/service-booking-2"}'
    ;;
  GET:repos/prashant7163/service-booking-2/milestones\?state=all\&per_page=100)
    jq '.milestones' "$FAKE_GH_STATE"
    ;;
  POST:repos/prashant7163/service-booking-2/milestones)
    number=$(jq '.milestones | length + 1' "$FAKE_GH_STATE")
    title=$(field title)
    description=$(field description)
    created=$(jq -n \
      --argjson number "$number" \
      --arg title "$title" \
      --arg description "$description" \
      --arg url "https://github.com/prashant7163/service-booking-2/milestone/$number" \
      '{number:$number,title:$title,description:$description,html_url:$url,state:"open"}')
    jq --argjson created "$created" '.milestones += [$created]' "$FAKE_GH_STATE" >"$FAKE_GH_STATE.tmp"
    mv "$FAKE_GH_STATE.tmp" "$FAKE_GH_STATE"
    printf '%s\n' "$created"
    ;;
  PATCH:repos/prashant7163/service-booking-2/milestones/*)
    if [[ ${FAKE_GH_FAIL_UPDATES:-0} == 1 && ! -e ${FAKE_GH_FAIL_MARKER:-} ]]; then
      : >"$FAKE_GH_FAIL_MARKER"
      printf '%s\n' 'simulated sensitive response body that must not be persisted' >&2
      exit 1
    fi
    number=${endpoint##*/}
    title=$(field title)
    description=$(field description)
    jq --argjson number "$number" --arg title "$title" --arg description "$description" \
      '(.milestones[] | select(.number == $number)) |= (.title=$title | .description=$description)' \
      "$FAKE_GH_STATE" >"$FAKE_GH_STATE.tmp"
    mv "$FAKE_GH_STATE.tmp" "$FAKE_GH_STATE"
    jq --argjson number "$number" '.milestones[] | select(.number == $number)' "$FAKE_GH_STATE"
    ;;
  GET:repos/prashant7163/service-booking-2/issues\?state=all\&per_page=100)
    jq '.issues' "$FAKE_GH_STATE"
    ;;
  POST:repos/prashant7163/service-booking-2/issues)
    number=$(jq '.issues | length + 1' "$FAKE_GH_STATE")
    title=$(field title)
    body=$(field body)
    milestone=$(field milestone)
    created=$(jq -n \
      --argjson number "$number" \
      --arg title "$title" \
      --arg body "$body" \
      --argjson milestone_number "$milestone" \
      --arg url "https://github.com/prashant7163/service-booking-2/issues/$number" \
      '{number:$number,title:$title,body:$body,html_url:$url,state:"open",milestone:{number:$milestone_number}}')
    jq --argjson created "$created" '.issues += [$created]' "$FAKE_GH_STATE" >"$FAKE_GH_STATE.tmp"
    mv "$FAKE_GH_STATE.tmp" "$FAKE_GH_STATE"
    printf '%s\n' "$created"
    ;;
  PATCH:repos/prashant7163/service-booking-2/issues/*)
    if [[ ${FAKE_GH_FAIL_UPDATES:-0} == 1 && ! -e ${FAKE_GH_FAIL_MARKER:-} ]]; then
      : >"$FAKE_GH_FAIL_MARKER"
      printf '%s\n' 'simulated sensitive response body that must not be persisted' >&2
      exit 1
    fi
    number=${endpoint##*/}
    title=$(field title)
    body=$(field body)
    milestone=$(field milestone)
    jq --argjson number "$number" --arg title "$title" --arg body "$body" --argjson milestone_number "$milestone" \
      '(.issues[] | select(.number == $number)) |= (.title=$title | .body=$body | .milestone.number=$milestone_number)' \
      "$FAKE_GH_STATE" >"$FAKE_GH_STATE.tmp"
    mv "$FAKE_GH_STATE.tmp" "$FAKE_GH_STATE"
    jq --argjson number "$number" '.issues[] | select(.number == $number)' "$FAKE_GH_STATE"
    ;;
  *)
    printf 'unsupported fake gh request: %s %s\n' "$method" "$endpoint" >&2
    exit 64
    ;;
esac
FAKE_GH
chmod +x "$TEST_DIR/bin/gh"
export PATH="$TEST_DIR/bin:$PATH"

assert_eq() {
  local expected=$1 actual=$2 message=$3
  if [[ $actual != "$expected" ]]; then
    printf 'FAIL: %s (expected %s, got %s)\n' "$message" "$expected" "$actual" >&2
    exit 1
  fi
}

run_sync() {
  SERVICE_BOOKING_GITHUB_REPOSITORY="$APPROVED_REPOSITORY" "$SYNC_SCRIPT" "$@"
}

# Scenario 1: registration creates one counterpart for every plan milestone and implementation task.
run_sync register
assert_eq 5 "$(jq '.milestones | length' "$FAKE_GH_STATE")" 'five milestones created'
assert_eq 11 "$(jq '.issues | length' "$FAKE_GH_STATE")" 'eleven implementation issues created'
assert_eq 5 "$(jq '.milestones | length' "$LINKS_FILE")" 'five milestone links recorded'
assert_eq 11 "$(jq '.tasks | length' "$LINKS_FILE")" 'eleven task links recorded'
assert_eq 5 "$(jq '[.milestones[].url] | unique | length' "$LINKS_FILE")" 'milestone URLs are unique'
assert_eq 11 "$(jq '[.tasks[].url] | unique | length' "$LINKS_FILE")" 'issue URLs are unique'
if jq -e '.. | strings | select(test("S64:|password|credential|token|secret|@"; "i"))' "$FAKE_GH_STATE" >/dev/null; then
  printf '%s\n' 'FAIL: outbound titles or bodies contain disallowed specification, credential, or personal content' >&2
  exit 1
fi

# Scenario 2: repeating registration reconciles existing records without duplication.
run_sync register
assert_eq 5 "$(jq '.milestones | length' "$FAKE_GH_STATE")" 'repeat run does not duplicate milestones'
assert_eq 11 "$(jq '.issues | length' "$FAKE_GH_STATE")" 'repeat run does not duplicate issues'

# Scenario 3: repository mismatch fails closed before any GitHub call and preserves local links.
links_before=$(shasum -a 256 "$LINKS_FILE" | awk '{print $1}')
calls_before=$(wc -l <"$FAKE_GH_LOG" | tr -d ' ')
if SERVICE_BOOKING_GITHUB_REPOSITORY=https://github.com/example/wrong.git "$SYNC_SCRIPT" register >/dev/null 2>&1; then
  printf '%s\n' 'FAIL: repository mismatch unexpectedly succeeded' >&2
  exit 1
fi
assert_eq "$links_before" "$(shasum -a 256 "$LINKS_FILE" | awk '{print $1}')" 'repository mismatch preserves links'
assert_eq "$calls_before" "$(wc -l <"$FAKE_GH_LOG" | tr -d ' ')" 'repository mismatch performs no GitHub call'

# Scenario 4: one update failure preserves links and writes a secret-free actionable retry.
export FAKE_GH_FAIL_UPDATES=1
export FAKE_GH_FAIL_MARKER="$TEST_DIR/update-failed-once"
if run_sync checkpoint >/dev/null 2>&1; then
  printf '%s\n' 'FAIL: forced update failure unexpectedly succeeded' >&2
  exit 1
fi
assert_eq "$links_before" "$(shasum -a 256 "$LINKS_FILE" | awk '{print $1}')" 'failed update preserves links'
jq -e '
  .operation == "checkpoint" and
  (.local_event_sequence | type == "number") and
  (.attempt | type == "number" and . >= 1) and
  .error_class == "github_api_failure" and
  (.next_command | contains("sync-work-items.sh checkpoint")) and
  ([.. | strings] | join(" ") | test("sensitive response body|credential|token|secret"; "i") | not)
' "$RETRY_FILE" >/dev/null
unset FAKE_GH_FAIL_UPDATES
run_sync checkpoint
run_sync verify

printf '%s\n' '4 synchronization scenarios passed'
