#!/usr/bin/env bash
# Rebuild every STL (and the preview image) from advent_calendar.scad.
# Needs OpenSCAD on your PATH. Pass extra -D overrides to change sizes, e.g.
#   ./export.sh -D inner_w=60 -D inner_h=60
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p stl
scad=advent_calendar.scad

openscad "$@" -D 'part="module"' -o stl/frame_module.stl "$scad"
openscad "$@" -D 'part="key"'    -o stl/key.stl          "$scad"
openscad "$@" -D 'part="hanger"' -o stl/hanger.stl       "$scad"
for n in $(seq 1 24); do
  openscad "$@" -D 'part="drawer"' -D "drawer_number=$n" -o "$(printf 'stl/drawer_%02d.stl' "$n")" "$scad"
done

# Preview needs a display; on a headless machine install xvfb and this uses it.
run=""; [ -z "${DISPLAY:-}" ] && command -v xvfb-run >/dev/null && run="xvfb-run -a"
$run openscad "$@" -D 'part="assembly"' --imgsize=1600,1200 \
  --camera=183,122,30,25,0,15,900 --colorscheme=Tomorrow -o preview.png "$scad" || true
