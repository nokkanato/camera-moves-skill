// Camera presets for scene.html. One entry per angle / move in the camera-moves catalogue.
// Person stands at x=0,z=0 facing +z. Feet y=0, chest y≈1.2, head centre y=1.62. Units are metres.
// Key: { t, pos:[x,y,z], look:[x,y,z], fov?, roll?, ease? }
//   fov  = vertical field of view in degrees (default 55); change it between keys for a zoom
//   roll = degrees, tilts the horizon (dutch angle)
//   ease = 'linear' for no slow-in/out into that key (middle keys of multi-key paths)
// Preset option: props:false hides the pillars and beams (floor grid and figure only).
// Add a move: add an entry here, then `node render.mjs --preset <name>`.

const D = 6; // seconds

const hold = (pos, look, extra = {}) => [
  { t: 0, pos, look, ...extra },
  { t: D, pos, look, ...extra },
];
const move = (a, b) => [{ t: 0, ...a }, { t: D, ...b }];

// Camera on a circle of radius r at height y around the person, aimed at chest/head height.
function orbit(r, y, fromDeg, toDeg, stepDeg, lookY = 1.5) {
  const keys = [];
  const n = Math.round(Math.abs(toDeg - fromDeg) / stepDeg);
  for (let i = 0; i <= n; i++) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / n) * Math.PI) / 180;
    keys.push({ t: (D * i) / n, pos: [r * Math.sin(a), y, r * Math.cos(a)], look: [0, lookY, 0], ease: 'linear' });
  }
  return keys;
}

// Dolly zoom: camera travels zFrom -> zTo while the lens changes so the subject keeps the same size.
function dollyZoom(zFrom, zTo, fovFrom, steps = 12) {
  const size = zFrom * Math.tan((fovFrom * Math.PI) / 360);
  const keys = [];
  for (let i = 0; i <= steps; i++) {
    const z = zFrom + ((zTo - zFrom) * i) / steps;
    keys.push({ t: (D * i) / steps, pos: [0, 1.5, z], look: [0, 1.55, 0], fov: (2 * Math.atan(size / z) * 180) / Math.PI, ease: 'linear' });
  }
  return keys;
}

export const PRESETS = {
  // ---- angles (camera holds still) --------------------------------------
  angle_eye_level: { group: 'Angle', label: 'Eye level', keys: hold([0, 1.62, 1.6], [0, 1.55, 0]) },
  angle_low: { group: 'Angle', label: 'Low angle', keys: hold([0, 1.0, 1.1], [0, 1.6, 0]) },
  angle_worms_eye: { group: 'Angle', label: "Worm's eye", keys: hold([0, 0.12, 1.3], [0, 1.5, 0]) },
  angle_high: { group: 'Angle', label: 'High angle', keys: hold([0, 2.6, 1.4], [0, 1.4, 0]) },
  angle_overhead: { group: 'Angle', label: "Overhead / bird's eye", keys: hold([0, 3.6, 0.05], [0, 0.6, 0]) },
  angle_dutch: { group: 'Angle', label: 'Dutch angle', keys: hold([0, 1.5, 1.6], [0, 1.5, 0], { roll: 20 }) },

  // ---- camera moves ------------------------------------------------------
  pan_left_to_right: { group: 'Move', label: 'Pan left to right', keys: move({ pos: [0, 1.5, 2.2], look: [-1.5, 1.4, 0] }, { pos: [0, 1.5, 2.2], look: [1.5, 1.4, 0] }) },
  tilt_up: { group: 'Move', label: 'Tilt up (feet to face)', keys: move({ pos: [0, 1.2, 1.6], look: [0, 0.3, 0] }, { pos: [0, 1.2, 1.6], look: [0, 1.7, 0] }) },
  roll: { group: 'Move', label: 'Roll', keys: move({ pos: [0, 1.5, 1.6], look: [0, 1.5, 0], roll: 0 }, { pos: [0, 1.5, 1.6], look: [0, 1.5, 0], roll: 180 }) },
  push_in: { group: 'Move', label: 'Push-in (dolly in)', keys: move({ pos: [0, 1.5, 2.4], look: [0, 1.6, 0] }, { pos: [0, 1.5, 0.9], look: [0, 1.6, 0] }) },
  pull_out: { group: 'Move', label: 'Pull-out (dolly out)', keys: move({ pos: [0, 1.5, 0.9], look: [0, 1.6, 0] }, { pos: [0, 1.5, 2.4], look: [0, 1.6, 0] }) },
  truck_left_to_right: { group: 'Move', label: 'Truck left to right', keys: move({ pos: [-0.6, 1.4, 2.6], look: [-0.6, 1.4, 0] }, { pos: [0.6, 1.4, 2.6], look: [0.6, 1.4, 0] }) },
  pedestal_up: { group: 'Move', label: 'Pedestal up', keys: move({ pos: [0, 0.5, 1.6], look: [0, 0.5, 0] }, { pos: [0, 1.7, 1.6], look: [0, 1.7, 0] }) },
  low_angle_rise: {
    group: 'Move', label: 'Low-angle rise',
    keys: [
      { t: 0.0, pos: [0, 0.80, 0.95], look: [0, 1.00, 0] },   // waist height, aimed at the torso, face out of frame
      { t: 4.5, pos: [0, 1.27, 0.62], look: [0, 1.63, 0] },   // risen to chest height, looking UP at the face
      { t: 6.0, pos: [0, 1.29, 0.55], look: [0, 1.63, 0] },   // slow creep in while holding the low angle
    ],
  },
  crane_up: { group: 'Move', label: 'Crane up', keys: move({ pos: [0, 1.2, 1.5], look: [0, 1.3, 0] }, { pos: [0, 4, 3.5], look: [0, 1.3, 0] }) },
  crane_down: { group: 'Move', label: 'Crane down', keys: move({ pos: [0, 4, 3.5], look: [0, 1.3, 0] }, { pos: [0, 1.2, 1.5], look: [0, 1.3, 0] }) },
  arc_front_to_side: { group: 'Move', label: 'Arc (front to side)', keys: orbit(1.6, 1.5, 0, 90, 15) },
  orbit_360: { group: 'Move', label: '360 orbit', keys: orbit(1.8, 1.5, 0, 360, 15) },
  orbit_360_clean: { group: 'Move', label: '360 orbit, no pillars', props: false, keys: orbit(1.8, 1.5, 0, 360, 15) },
  aerial_flyover: { group: 'Move', label: 'Aerial flyover', keys: move({ pos: [0, 6, 12], look: [0, 1, 0] }, { pos: [0, 5, 2], look: [0, 1, 0] }) },
  fpv_dive: {
    group: 'Move', label: 'FPV drone dive',
    keys: [
      { t: 0.0, pos: [3, 5, 8], look: [0, 1.5, 0] },
      { t: 2.5, pos: [1.4, 2.4, 3.2], look: [0, 1.5, 0], roll: -18, ease: 'linear' },
      { t: 4.5, pos: [0.7, 1.7, 1.0], look: [0, 1.6, 0], roll: 12, ease: 'linear' },
      { t: 6.0, pos: [0.75, 1.9, -1.5], look: [0.9, 1.7, -5], roll: 0 },
    ],
  },
  whip_pan: {
    group: 'Move', label: 'Whip pan (onto the subject)',
    keys: [
      { t: 0.0, pos: [0, 1.5, 2.2], look: [-5, 1.4, -1] },
      { t: 2.8, pos: [0, 1.5, 2.2], look: [-5, 1.4, -1] },
      { t: 3.1, pos: [0, 1.5, 2.2], look: [0, 1.5, 0], ease: 'linear' },
      { t: 6.0, pos: [0, 1.5, 2.2], look: [0, 1.5, 0] },
    ],
  },
  dutch_push_in: { group: 'Move', label: 'Dutch-angle push-in', keys: move({ pos: [0, 1.5, 2.4], look: [0, 1.6, 0], roll: 20 }, { pos: [0, 1.5, 0.9], look: [0, 1.6, 0], roll: 20 }) },
  dutch_to_level_push_in: { group: 'Move', label: 'Dutch to level push-in', keys: move({ pos: [0, 1.5, 2.4], look: [0, 1.6, 0], roll: 20 }, { pos: [0, 1.5, 0.9], look: [0, 1.6, 0], roll: 0 }) },

  // ---- lens moves (camera body stays put) --------------------------------
  zoom_in: { group: 'Lens', label: 'Zoom in', keys: move({ pos: [0, 1.5, 2.4], look: [0, 1.6, 0], fov: 55 }, { pos: [0, 1.5, 2.4], look: [0, 1.6, 0], fov: 25 }) },
  zoom_out: { group: 'Lens', label: 'Zoom out', keys: move({ pos: [0, 1.5, 2.4], look: [0, 1.6, 0], fov: 25 }, { pos: [0, 1.5, 2.4], look: [0, 1.6, 0], fov: 55 }) },
  crash_zoom: {
    group: 'Lens', label: 'Crash zoom',
    keys: [
      { t: 0.0, pos: [0, 1.5, 2.4], look: [0, 1.6, 0], fov: 55 },
      { t: 2.5, pos: [0, 1.5, 2.4], look: [0, 1.6, 0], fov: 55 },
      { t: 2.8, pos: [0, 1.5, 2.4], look: [0, 1.6, 0], fov: 22, ease: 'linear' },
      { t: 6.0, pos: [0, 1.5, 2.4], look: [0, 1.6, 0], fov: 22 },
    ],
  },
  dolly_zoom: { group: 'Lens', label: 'Dolly zoom (vertigo)', keys: dollyZoom(2.6, 1.0, 28) },
};

export const DEFAULT_PRESET = 'low_angle_rise';
export const DURATION = D;
