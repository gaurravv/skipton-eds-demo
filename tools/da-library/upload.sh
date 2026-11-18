#!/usr/bin/env bash
# Uploads the DA block library (example docs + blocks sheet) to your own DA site.
# Usage: DA_TOKEN=<token> ./tools/da-library/upload.sh [org] [site]
set -euo pipefail
ORG="${1:-gaurravv}"
SITE="${2:-skipton-eds-demo}"
: "${DA_TOKEN:?Set DA_TOKEN (see tools/da-library/README.md)}"
DIR="$(cd "$(dirname "$0")" && pwd)"
BASE="https://admin.da.live/source/${ORG}/${SITE}/docs/library"

put() {
  local file="$1" dest="$2" type="$3"
  code=$(curl -s -o /dev/null -w '%{http_code}' -X PUT "${BASE}/${dest}" \
    -H "Authorization: Bearer ${DA_TOKEN}" -F "data=@${file};type=${type}")
  echo "${code}  ${dest}"
  [[ "$code" == 2* ]] || { echo "Upload failed for ${dest}" >&2; exit 1; }
}

ROWS=""
for f in "${DIR}"/blocks/*.html; do
  name="$(basename "$f" .html)"
  put "$f" "blocks/${name}.html" "text/html"
  title="$(echo "$name" | awk -F- '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1')"
  ROWS+="{\"name\":\"${title}\",\"path\":\"https://content.da.live/${ORG}/${SITE}/docs/library/blocks/${name}\"},"
done

SHEET="$(mktemp)"
COUNT=$(ls "${DIR}"/blocks/*.html | wc -l | tr -d ' ')
printf '{"total":%s,"limit":%s,"offset":0,"data":[%s],":type":"sheet"}' "$COUNT" "$COUNT" "${ROWS%,}" > "$SHEET"
put "$SHEET" "blocks.json" "application/json"
rm -f "$SHEET"

echo
echo "Done. Config 'library' row must be:"
echo "  title=Blocks  path=https://content.da.live/${ORG}/${SITE}/docs/library/blocks.json"
