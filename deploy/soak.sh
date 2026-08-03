#!/bin/bash
#
# ATLANTIS — overnight soak recorder.
#
# Not telemetry and not part of the app. A throwaway diagnostic you run
# alongside a long test so that in the morning there is evidence instead of a
# guess. Samples every 5 minutes into logs/soak.log:
#
#   uptime, RSS of the app and of WebKit's helper processes, system memory
#   pressure, whether /health answers, CSP violations, crash-report count,
#   and how many times the app has restarted
#
# The question it exists to answer: does memory climb, and if the app dies,
# when and with what footprint.
#
#   ./deploy/soak.sh &            # start alongside the app
#   tail -f logs/soak.log
#   pkill -f deploy/soak.sh       # stop
#
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$REPO_DIR/logs/soak.log"
PORT="${ATLANTIS_PORT:-5001}"
INTERVAL="${SOAK_INTERVAL:-300}"

mkdir -p "$REPO_DIR/logs"

crash_count() { ls ~/Library/Logs/DiagnosticReports/Python*.ips 2>/dev/null | wc -l | tr -d ' '; }
app_pid()     { pgrep -f 'main\.py' 2>/dev/null | head -1; }

rss_mb() {  # total RSS in MB for a pgrep pattern
    ps -eo rss,command 2>/dev/null | grep -E "$1" | grep -v grep \
        | awk '{s+=$1} END {printf "%.0f", s/1024}'
}

start_crashes=$(crash_count)
start_epoch=$(date +%s)
last_pid=""
restarts=0

{
  echo "===================================================================="
  echo "soak started $(date '+%Y-%m-%d %H:%M:%S')  interval=${INTERVAL}s port=$PORT"
  echo "baseline crash reports: $start_crashes"
  echo "===================================================================="
} >> "$OUT"

while true; do
    now=$(date '+%Y-%m-%d %H:%M:%S')
    elapsed=$(( ($(date +%s) - start_epoch) / 60 ))

    pid=$(app_pid)
    if [ -n "$pid" ]; then
        [ -n "$last_pid" ] && [ "$pid" != "$last_pid" ] && restarts=$((restarts + 1))
        last_pid="$pid"
        up=$(ps -o etime= -p "$pid" 2>/dev/null | tr -d ' ')
        py=$(rss_mb 'main\.py')
        wk=$(rss_mb 'WebKit')
        total=$(( ${py:-0} + ${wk:-0} ))
        state="up=$up py=${py}MB webkit=${wk}MB total=${total}MB"
    else
        state="NOT RUNNING"
    fi

    if health=$(curl -fsS -m 5 "http://localhost:$PORT/health" 2>/dev/null); then
        csp=$(echo "$health" | sed -n 's/.*"csp_violations":\([0-9]*\).*/\1/p')
        hstate="health=ok csp=${csp:-?}"
    else
        hstate="health=NO_RESPONSE"
    fi

    free=$(memory_pressure 2>/dev/null | sed -n 's/.*free percentage: *\([0-9]*\)%.*/\1/p')
    swap=$(sysctl -n vm.swapusage 2>/dev/null | sed -n 's/.*used = \([0-9.]*[MG]\).*/\1/p')
    crashes=$(crash_count)
    newcrash=$(( crashes - start_crashes ))

    printf '%s  t+%-5smin  %s  %s  sysfree=%s%%  swap=%s  restarts=%s  newcrashes=%s\n' \
        "$now" "$elapsed" "$state" "$hstate" "${free:-?}" "${swap:-?}" "$restarts" "$newcrash" >> "$OUT"

    sleep "$INTERVAL"
done
