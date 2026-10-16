// Refillable advent calendar: 24 pull-out drawers in six 2x2 frame modules.
//
// Every size below is a parameter. Change what you like, then export the part
// you want with the `part` setting (or run calendar/export.sh to rebuild all STLs).
//
// Print orientation is baked into each part, so exported STLs are ready to slice
// with no supports:
//   module  - back face down, drawer openings facing up
//   drawer  - open top facing up, number face vertical
//   key     - lying flat
//   hanger  - flat tab down, fin pointing up

/* [Output] */
// Which part to render
part = "assembly"; // [assembly, module, drawer, key, hanger, plate_drawers]
// Number on the drawer when part = "drawer"
drawer_number = 1; // [1:24]

/* [Drawer inside space (mm)] */
inner_w = 50;   // left to right
inner_h = 52;   // floor to rim
inner_d = 50;   // front to back

/* [Drawer walls (mm)] */
drawer_wall  = 1.6;
drawer_floor = 1.2;
front_t      = 3;    // drawer front panel thickness

/* [Frame (mm)] */
clearance = 0.4;     // gap around each drawer, per side
divider   = 7;       // wall between neighbouring cubbies (outer walls are half this)
back_t    = 2;       // frame back wall
back_gap  = 0.6;     // space behind a closed drawer
cols_per_module = 2;
rows_per_module = 2;
modules_x = 3;
modules_y = 2;

/* [Click-shut detent (mm)] */
detent_h   = 0.5;    // ridge height on the cubby floor
detent_pos = 3;      // distance of the ridge behind the frame front

/* [Number and finger pull] */
number_font  = "Liberation Sans:style=Bold";
number_size  = 24;
number_depth = 1.0;  // positive = recessed, negative = raised
pull_r       = 9;    // radius of the finger scoop in the top of each front
panel_gap    = 4.5;  // visible frame between neighbouring drawer fronts

/* [Joining keys (mm)] */
key_neck  = 6;       // width at the seam
key_wide  = 9;       // width at the deepest point
key_depth = 2;       // how far the key reaches into each module
key_clr   = 0.2;     // printed key is this much smaller per face
key_front_stop = 2;  // slots stop this far short of the front

/* [Hanger] */
hanger_w    = 30;
hanger_h    = 20;
hanger_t    = 5;
hanger_hole = 4.5;
hanger_fin  = 25;

/* [Hidden] */
$fn = 64;
eps = 0.01;

// ---------- derived sizes ----------
body_w    = inner_w + 2 * drawer_wall;
body_h    = inner_h + drawer_floor;
body_d    = inner_d + drawer_wall;          // behind the front panel
open_w    = body_w + 2 * clearance;
open_h    = body_h + 2 * clearance;
pitch_x   = open_w + divider;
pitch_y   = open_h + divider;
frame_d   = back_t + body_d + back_gap;
mod_w     = cols_per_module * pitch_x;
mod_h     = rows_per_module * pitch_y;
// Front panel: bottom flush with the drawer body so it prints flat, top and
// sides overlap the opening so the panel is also the drawer stop.
panel_w   = pitch_x - panel_gap;
panel_h   = pitch_y - panel_gap;
assert(panel_w > open_w && panel_h > open_h, "panel_gap too big: fronts must overlap the openings");
key_len   = frame_d - key_front_stop - 0.5;

echo(str("Drawer inside: ", inner_w, " x ", inner_h, " x ", inner_d, " mm"));
echo(str("Module: ", mod_w, " x ", mod_h, " x ", frame_d, " mm"));
echo(str("Calendar: ", mod_w * modules_x, " x ", mod_h * modules_y, " x ",
         frame_d + front_t, " mm"));

// ---------- 2D profiles ----------
// Half of the bowtie key: narrow at y=0 (the seam), wide at y=-d.
module half_key_2d(neck, wide, d) {
    polygon([[-neck/2, eps], [neck/2, eps], [wide/2, -d], [-wide/2, -d]]);
}

module key_2d() {
    offset(delta = -key_clr) {
        half_key_2d(key_neck, key_wide, key_depth);
        mirror([0, 1]) half_key_2d(key_neck, key_wide, key_depth);
    }
}

// ---------- frame module ----------
// Built with z = 0 at the back, openings at z = frame_d (print as-is).
module frame_module() {
    difference() {
        cube([mod_w, mod_h, frame_d]);
        for (c = [0 : cols_per_module - 1], r = [0 : rows_per_module - 1])
            translate([(c + 0.5) * pitch_x - open_w / 2,
                       (r + 0.5) * pitch_y - open_h / 2,
                       back_t])
                cube([open_w, open_h, frame_d]);
        // dovetail slots, one centred on each outer face
        slot_len = frame_d - key_front_stop + 1;
        translate([mod_w / 2, mod_h, -1])
            linear_extrude(slot_len) half_key_2d(key_neck, key_wide, key_depth);
        translate([mod_w / 2, 0, -1])
            linear_extrude(slot_len) mirror([0, 1]) half_key_2d(key_neck, key_wide, key_depth);
        translate([0, mod_h / 2, -1])
            linear_extrude(slot_len) rotate(90) half_key_2d(key_neck, key_wide, key_depth);
        translate([mod_w, mod_h / 2, -1])
            linear_extrude(slot_len) rotate(-90) half_key_2d(key_neck, key_wide, key_depth);
    }
    // click-shut ridges, 45 degree sides so they print on the vertical floor
    for (c = [0 : cols_per_module - 1], r = [0 : rows_per_module - 1])
        translate([(c + 0.5) * pitch_x - open_w / 2,
                   (r + 0.5) * pitch_y - open_h / 2,
                   frame_d - detent_pos])
            rotate([0, 90, 0]) linear_extrude(open_w)
                polygon([[-detent_h, 0], [0, detent_h], [detent_h, 0]]);
}

// ---------- drawer ----------
// Built for printing: bottom on z = 0, front panel face at y = 0, open top.
module drawer(n) {
    difference() {
        union() {
            translate([-panel_w / 2, 0, 0]) cube([panel_w, front_t, panel_h]);
            translate([-body_w / 2, front_t - eps, 0]) cube([body_w, body_d + eps, body_h]);
        }
        // storage space
        translate([-inner_w / 2, front_t, drawer_floor])
            cube([inner_w, inner_d, body_h]);
        // finger scoop
        translate([0, -1, panel_h]) rotate([-90, 0, 0])
            cylinder(r = pull_r, h = front_t + 2);
        // detent groove under the drawer, lines up with the frame ridge when shut
        translate([-body_w / 2 - 1, front_t + detent_pos, 0])
            rotate([0, 90, 0]) linear_extrude(body_w + 2)
                polygon([[eps, -(detent_h + 0.2)], [-(detent_h + 0.2), 0], [eps, detent_h + 0.2]]);
        if (number_depth > 0) number(n, number_depth + 1);
    }
    if (number_depth < 0) number(n, -number_depth);
}

module number(n, depth) {
    // recessed numbers start just inside the face, raised ones start at it
    y0 = number_depth > 0 ? number_depth : 0;
    translate([0, y0, (panel_h - pull_r) / 2])
        rotate([90, 0, 0]) linear_extrude(depth)
            text(str(n), size = number_size, font = number_font,
                 halign = "center", valign = "center");
}

// ---------- key and hanger ----------
module key() {
    // lying flat: the key's length runs along x
    translate([0, 0, key_depth - key_clr])
        rotate([0, 90, 0]) linear_extrude(key_len) rotate(90) key_2d();
}

module hanger() {
    difference() {
        translate([-hanger_w / 2, 0, 0]) cube([hanger_w, hanger_h, hanger_t]);
        translate([0, hanger_h * 0.62, -1]) cylinder(d = hanger_hole, h = hanger_t + 2);
    }
    // fin that slides into a top slot, joined to the tab through the neck
    linear_extrude(hanger_fin) {
        offset(delta = -key_clr) half_key_2d(key_neck, key_wide, key_depth);
        translate([-(key_neck / 2 - key_clr), -key_depth / 2])
            square([key_neck - 2 * key_clr, key_depth / 2 + 1]);
    }
}

// ---------- layouts ----------
module assembly() {
    for (mx = [0 : modules_x - 1], my = [0 : modules_y - 1])
        translate([mx * mod_w, my * mod_h, 0]) {
            color("Tan") frame_module();
            for (c = [0 : cols_per_module - 1], r = [0 : rows_per_module - 1]) {
                gc = mx * cols_per_module + c;
                gr = (modules_y * rows_per_module - 1) - (my * rows_per_module + r);
                n = gr * modules_x * cols_per_module + gc + 1;
                translate([(c + 0.5) * pitch_x,
                           (r + 0.5) * pitch_y - open_h / 2,
                           frame_d + front_t])
                    rotate([-90, 0, 0])
                        color(n % 2 ? "FireBrick" : "ForestGreen") drawer(n);
            }
        }
    for (mx = [0 : modules_x - 1])
        translate([mx * mod_w + mod_w / 2, modules_y * mod_h, 0])
            color("Goldenrod") hanger();
}

module plate_drawers() {
    // 4 drawers per plate fit a 220 x 220 bed
    for (i = [0 : 3])
        translate([(i % 2) * (panel_w + 6), floor(i / 2) * (front_t + body_d + 6), 0])
            drawer(drawer_number + i);
}

if (part == "assembly")      assembly();
else if (part == "module")   frame_module();
else if (part == "drawer")   drawer(drawer_number);
else if (part == "key")      key();
else if (part == "hanger")   hanger();
else if (part == "plate_drawers") plate_drawers();
