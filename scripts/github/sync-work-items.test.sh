#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)
SYNC_SCRIPT="$ROOT_DIR/scripts/github/sync-work-items.sh"
LINKS_FILE="$ROOT_DIR/docs/project/tracking/github-links.json"
RETRY_FILE="$ROOT_DIR/docs/project/tracking/sync-retry.json"
APPROVED_REPOSITORY="https://github.com/prashant7163/service-booking-2.git"
APPROVED_REPOSITORY_WEB="https://github.com/prashant7163/service-booking-2"

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

# Scenario 5: every governed lifecycle checkpoint replaces the redacted projection in place.
PROJECTION_ROOT="$TEST_DIR/projection-repo"
PROJECTION_PLAN_SNAPSHOT=".studio/runs/service-booking-2-benchmark/artifacts/2c877de39821812f3b1014e83e968511f1474780f65bcc7d21e76433cd627073.json"
mkdir -p \
  "$PROJECTION_ROOT/scripts/github" \
  "$PROJECTION_ROOT/docs/project/tracking" \
  "$PROJECTION_ROOT/docs/discovery" \
  "$PROJECTION_ROOT/docs/project/planning" \
  "$PROJECTION_ROOT/docs/project/readiness/service-booking-2-foundation" \
  "$PROJECTION_ROOT/docs/project/reviews" \
  "$PROJECTION_ROOT/$(dirname "$PROJECTION_PLAN_SNAPSHOT")"
cp "$SYNC_SCRIPT" "$PROJECTION_ROOT/scripts/github/sync-work-items.sh"
cp "$LINKS_FILE" "$PROJECTION_ROOT/docs/project/tracking/github-links.json"
cp "$RETRY_FILE" "$PROJECTION_ROOT/docs/project/tracking/sync-retry.json"
cp "$ROOT_DIR/docs/discovery/project-specification.json" "$PROJECTION_ROOT/docs/discovery/project-specification.json"
cp "$ROOT_DIR/docs/project/planning/phase-one-milestone-plan.json" "$PROJECTION_ROOT/docs/project/planning/phase-one-milestone-plan.json"
cp "$ROOT_DIR/docs/project/readiness/service-booking-2-foundation/rolling-progress-plan.json" \
  "$PROJECTION_ROOT/docs/project/readiness/service-booking-2-foundation/rolling-progress-plan.json"
printf '%s\n' '{"review_id":"foundation-milestone-review"}' >"$PROJECTION_ROOT/docs/project/reviews/foundation-milestone-review.json"
cp "$ROOT_DIR/docs/project/planning/phase-one-milestone-plan.json" "$PROJECTION_ROOT/$PROJECTION_PLAN_SNAPSHOT"

cat >"$PROJECTION_ROOT/studioctl" <<'FAKE_STUDIOCTL'
#!/usr/bin/env bash
set -euo pipefail

scenario=${FAKE_STUDIO_SCENARIO:-registration}
case "$scenario" in
  registration)
    sequence=21 phase=ready task_state=planned event_type=readiness.passed event_state=ready resume_classification=null blocker='[]'
    ;;
  work-start)
    sequence=22 phase=running task_state=running event_type=task.started event_state=running resume_classification=null blocker='[]'
    ;;
  blocked)
    sequence=23 phase=running task_state=blocked event_type=task.blocked event_state=blocked resume_classification=null blocker='["token=local-only-secret"]'
    ;;
  resumed)
    sequence=24 phase=running task_state=running event_type=run.resumed event_state=running resume_classification=exact blocker='[]'
    ;;
  verification-ready)
    sequence=25 phase=running task_state=implementation_complete event_type=task.transition event_state=implementation_complete resume_classification=exact blocker='[]'
    ;;
  human-decision)
    sequence=40 phase=approved task_state=complete event_type=checkpoint.created event_state=approved resume_classification=exact blocker='[]'
    ;;
  *) exit 64 ;;
esac

if [[ ${1:-} == status ]]; then
  jq -n \
    --arg phase "$phase" \
    --arg task_state "$task_state" \
    --arg resume_classification "$resume_classification" \
    --argjson sequence "$sequence" \
    --argjson blockers "$blocker" \
    '{
      code:"ok",
      state:{
        project_id:"service-booking-2",
        run_id:"service-booking-2-benchmark",
        phase:$phase,
        active_milestone_id:"service-booking-2-foundation",
        active_task_id:"service-booking-2-design-interactions",
        active_attempt_number:1,
        task_states:{"service-booking-2-design-interactions":$task_state},
        blockers:$blockers,
        latest_resume_classification:(if $resume_classification == "null" then null else $resume_classification end),
        current_action:"credential=local-only-secret",
        next_action:"send token local-only-secret",
        capability_states:{"github-project-workflow":"active"},
        last_event_sequence:$sequence,
        artifacts:[
          {
            kind:"specification",
            subject_id:"service-booking-2",
            sha256:"04350ae40cd031b0368e4b4508ffced35f3ed37df563a27c6138426d1ac96d29",
            snapshot_locator:".studio/runs/service-booking-2-benchmark/artifacts/specification.json",
            source_locator:"docs/discovery/project-specification.json"
          },
          {
            kind:"plan",
            subject_id:"service-booking-2-phase-one",
            sha256:"2c877de39821812f3b1014e83e968511f1474780f65bcc7d21e76433cd627073",
            snapshot_locator:".studio/runs/service-booking-2-benchmark/artifacts/2c877de39821812f3b1014e83e968511f1474780f65bcc7d21e76433cd627073.json",
            source_locator:"docs/project/planning/phase-one-milestone-plan.json"
          },
          {
            kind:"supporting_evidence",
            subject_id:null,
            sha256:"7f956eedbe8ed1f2ea7663d3e71f60792b5a7f95bd4b394644544dbdbfeba35c",
            snapshot_locator:".studio/runs/service-booking-2-benchmark/artifacts/progress.json",
            source_locator:"docs/project/readiness/service-booking-2-foundation/rolling-progress-plan.json"
          },
          {
            kind:"gate",
            subject_id:"foundation-milestone-review",
            sha256:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            snapshot_locator:".studio/runs/service-booking-2-benchmark/artifacts/review.json",
            source_locator:"docs/project/reviews/foundation-milestone-review.json"
          },
          {
            kind:"supporting_evidence",
            subject_id:"token-local-only-secret",
            sha256:"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            snapshot_locator:".studio/runs/service-booking-2-benchmark/artifacts/secret.json",
            source_locator:"../credential-local-only-secret.json"
          }
        ]
      }
    }'
elif [[ ${1:-} == history ]]; then
  jq -n \
    --arg event_type "$event_type" \
    --arg event_state "$event_state" \
    --argjson sequence "$sequence" \
    '{
      code:"ok",
      details:{events:[{
        sequence:$sequence,
        event_type:$event_type,
        milestone_id:"service-booking-2-foundation",
        task_id:"service-booking-2-design-interactions",
        payload:{
          state:$event_state,
          approval:{
            decision:"approved",
            decided_by:"private-owner@example.com",
            comment:"credential=local-only-secret"
          }
        }
      }]}
    }'
else
  exit 64
fi
FAKE_STUDIOCTL
chmod +x "$PROJECTION_ROOT/studioctl"
git -C "$PROJECTION_ROOT" init -q
git -C "$PROJECTION_ROOT" config user.email test@example.invalid
git -C "$PROJECTION_ROOT" config user.name 'Synchronization Contract Test'
git -C "$PROJECTION_ROOT" remote add origin "$APPROVED_REPOSITORY"
git -C "$PROJECTION_ROOT" add .
git -C "$PROJECTION_ROOT" commit -qm 'test fixture'
PROJECTION_COMMIT=$(git -C "$PROJECTION_ROOT" rev-parse HEAD)
PROJECTION_SYNC_SCRIPT="$PROJECTION_ROOT/scripts/github/sync-work-items.sh"
PROJECTION_LINKS_FILE="$PROJECTION_ROOT/docs/project/tracking/github-links.json"

run_projection_sync() {
  SERVICE_BOOKING_GITHUB_REPOSITORY="$APPROVED_REPOSITORY" "$PROJECTION_SYNC_SCRIPT" "$@"
}

assert_projection() {
  local checkpoint=$1 phase=$2 active_state=$3 blocker_count=$4 body description
  body=$(jq -r '.issues[0].body' "$FAKE_GH_STATE")
  description=$(jq -r '.milestones[0].description' "$FAKE_GH_STATE")
  for rendered in "$body" "$description"; do
    [[ $rendered == *"Checkpoint: \`$checkpoint\`"* ]] || {
      printf 'FAIL: %s projection missing checkpoint\n' "$checkpoint" >&2
      exit 1
    }
    [[ $rendered == *"Run phase: \`$phase\`"* ]] || {
      printf 'FAIL: %s projection missing phase\n' "$checkpoint" >&2
      exit 1
    }
    [[ $rendered == *"Active task state: \`$active_state\`"* ]] || {
      printf 'FAIL: %s projection missing active task state\n' "$checkpoint" >&2
      exit 1
    }
    [[ $rendered == *"Blocker count: \`$blocker_count\`"* ]] || {
      printf 'FAIL: %s projection missing blocker count\n' "$checkpoint" >&2
      exit 1
    }
    [[ $rendered == *"$APPROVED_REPOSITORY_WEB/blob/$PROJECTION_COMMIT/docs/discovery/project-specification.json"* ]] || {
      printf 'FAIL: %s projection missing approved evidence link\n' "$checkpoint" >&2
      exit 1
    }
  done
  assert_eq 5 "$(jq '.milestones | length' "$FAKE_GH_STATE")" "$checkpoint does not duplicate milestones"
  assert_eq 11 "$(jq '.issues | length' "$FAKE_GH_STATE")" "$checkpoint does not duplicate issues"
  if jq -e '.. | strings | select(test("local-only-secret|private-owner@|credential|token"; "i"))' "$FAKE_GH_STATE" >/dev/null; then
    printf 'FAIL: %s projection leaked sensitive Studio state\n' "$checkpoint" >&2
    exit 1
  fi
}

: >"$FAKE_GH_LOG"
printf '%s\n' '{"milestones":[],"issues":[]}' >"$FAKE_GH_STATE"

export FAKE_STUDIO_SCENARIO=registration
run_projection_sync register
assert_projection registration ready planned 0

export FAKE_STUDIO_SCENARIO=work-start
run_projection_sync checkpoint
assert_projection work-start running running 0

export FAKE_STUDIO_SCENARIO=blocked
run_projection_sync checkpoint
assert_projection blocked running blocked 1

export FAKE_STUDIO_SCENARIO=resumed
run_projection_sync checkpoint
assert_projection resumed running running 0

export FAKE_STUDIO_SCENARIO=verification-ready
run_projection_sync checkpoint
assert_projection verification-ready-handoff running implementation_complete 0

export FAKE_STUDIO_SCENARIO=human-decision
run_projection_sync checkpoint
assert_projection human-milestone-decision approved complete 0
jq '(.issues[0].body) |= sub("Checkpoint: `human-milestone-decision`"; "Checkpoint: `stale`")' \
  "$FAKE_GH_STATE" >"$FAKE_GH_STATE.tmp"
mv "$FAKE_GH_STATE.tmp" "$FAKE_GH_STATE"
if run_projection_sync verify >/dev/null 2>&1; then
  printf '%s\n' 'FAIL: verify accepted a stale checkpoint projection' >&2
  exit 1
fi
run_projection_sync checkpoint
run_projection_sync verify

assert_eq 16 "$(awk '$1 == "POST" {count++} END {print count+0}' "$FAKE_GH_LOG")" 'checkpoint projection creates each counterpart once'

printf '%s\n' '5 synchronization scenarios passed'
