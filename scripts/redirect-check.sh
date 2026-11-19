#!/usr/bin/env bash
# Checks every old passionatestaffing.com URL (and the apex / vercel.app hosts) returns ONE permanent redirect to the
# right page on www.passionateglobal.co.in.
#   Live (after DNS):  bash scripts/redirect-check.sh            > docs/seo/redirect-check.txt
#   Local (no DNS):    bash scripts/redirect-check.sh http://localhost:4174   (sends the Host header instead)
BASE="${1:-}"
NEW="https://www.passionateglobal.co.in"
pass=0; fail=0

check() { # host path expected
  local host=$1 path=$2 want=$3 url out code loc hops
  if [ -n "$BASE" ]; then
    out=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" -H "Host: $host" "$BASE$path")
  else
    url="https://$host$path"
    out=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$url")
  fi
  code=${out%% *}; loc=${out#* }
  if [[ "$code" =~ ^30[18]$ && "$loc" == "$want" ]]; then r=PASS; pass=$((pass+1)); else r=FAIL; fail=$((fail+1)); fi
  printf '%s  %-28s %-34s -> %s %s\n' "$r" "$host" "$path" "$code" "$loc"
}

for host in passionatestaffing.com www.passionatestaffing.com; do
  check $host /                               "$NEW/"
  check $host /index.html                     "$NEW/"
  check $host /about-us.html                  "$NEW/?from=about"
  check $host /about-us                       "$NEW/?from=about"
  check $host /services.html                  "$NEW/?from=services"
  check $host /infrastructure.html            "$NEW/?from=security"
  check $host /career.html                    "$NEW/?from=life"
  check $host /contact-us.html                "$NEW/?from=contact"
  check $host /contact-us/                    "$NEW/?from=contact"
  check $host /blog-list-1.html               "$NEW/"
  check $host /jobs-list-1.html               "$NEW/"
  check $host /company-dashboard-new-job.html "$NEW/"
  check $host /images/passionate.png          "$NEW/"
  check $host /random-$RANDOM                 "$NEW/"
done
check passionateglobal.co.in /                "$NEW/"
check passionateglobal.co.in /privacy-policy  "$NEW/privacy-policy"
echo "== $pass passed, $fail failed"
[ -z "$BASE" ] && { echo "== http:// (Vercel upgrades to https first, then the redirect above)"; curl -s -o /dev/null -w "http://passionatestaffing.com/about-us.html -> %{http_code} %{redirect_url}\n" http://passionatestaffing.com/about-us.html; }
exit $fail
