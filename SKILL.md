---
name: camera-moves
description: Pick, build and prompt a camera angle or camera movement for an AI video shot. Holds a catalogue of film camera angles and moves (low angle, dutch, push-in, orbit, crane, dolly zoom, whip pan, ...), what each one makes the viewer feel, a small three.js tool (camref) that renders any of them as a grey block-figure reference clip, and a prompt structure that makes a video model follow the clip. Use whenever the user asks for a camera move or angle, wants a shot to feel a certain way (intimidating, epic, lonely, tense, cute), asks "how should the camera move", wants a camera reference clip for a video model, or mentions three.js / Blender stick-figure or blockout references - even if they do not name the move.
---

# camera-moves - choose a camera angle/move, build a reference clip, prompt it

A camera move described only in text is a gamble: the video model picks its own path. A short reference clip of the
move, made from grey blocks in three.js, pins the path down. This skill is a framework for that: a catalogue of moves,
a tool that turns keyframes into a clip, and a prompt structure. It does not include a video-model client; use
whatever model and upload route the user already has.

## Workflow

1. **Translate the ask into an angle and a move.** People usually give a feeling ("intimidating", "epic reveal"), not
   a film term. Look it up in `references/catalogue.md` (the "pick by feeling" table at the top), then say which
   angle + move you picked in one line before building, so a wrong pick costs nothing.
2. **Build the reference clip** with camref (next section). Look at a few frames yourself before spending anything on
   generation: the move must be readable in the grey clip, or the model has nothing to follow.
3. **Write the prompt** using the structure under "Prompt structure". Start from `camref/prompt_template.txt`.
4. **Generate** with the user's video model, on its route that accepts a reference video plus a reference image (or
   first frame) of the real character and scene. Most services need the clip at a public URL and bill for the
   reference seconds as well as the output, so state the cost and get a yes first, and test at the lowest resolution.
5. **Compare** reference and result side by side (one frame per second is enough) and report where they differ.
   Record what you learn in the Status column of the catalogue.

Not every move needs a reference clip. Time effects (slow motion, speed ramp, freeze) and transitions (cuts, whip-pan
joins, dissolves) are done in the edit. The catalogue marks which is which.

## The camref tool

`camref/` in this skill's folder. `scene.html` is a three.js scene: a box-and-ball person at the origin facing +z
(feet y=0, head centre y=1.62, units in metres), a floor grid, and pillars and overhead beams so the camera can be
read from parallax. `presets.js` holds the camera paths. `render.mjs` steps the scene frame by frame in headless
Chromium and pipes the frames to ffmpeg (720x1280, 30fps, 6s by default).

Setup once per machine (macOS, Windows or Linux; needs Node 18+ and ffmpeg on PATH):

```bash
cd camref
npm install
npx playwright install chromium
```

If frames come out blank on a machine with no GPU, set the environment variable `CAMREF_GL=swiftshader`.
Renders go to `camref/out/`, which is not kept in git. If the skill folder is read-only, copy `camref/` into the
project and work there.

```bash
node render.mjs --list                                   # preset names
node render.mjs --preset orbit_360                       # -> out/library/orbit_360.mp4
node render.mjs --preset push_in --out out/my_shot.mp4   # same move, custom file
node render.mjs --all                                    # every preset + out/library/index.html gallery
```

Live preview: serve the `camref` folder with any static server and open `scene.html?preset=<name>`.

### Making it your own

The presets are starting points, not a fixed list. Everything is meant to be edited:

- **A new move** is a new entry in `presets.js`: a list of keys `{ t, pos:[x,y,z], look:[x,y,z] }` with optional
  `fov` (vertical degrees, default 55; change it over time for a zoom), `roll` (degrees, for a dutch angle) and
  `ease:'linear'` (no slow-in/out into that key; use it on the middle keys of a multi-key path such as an orbit, or
  the camera stutters at every key). Helpers `hold`, `move`, `orbit` and `dollyZoom` cover the common shapes.
  Add a new entry rather than changing an existing one, so earlier results stay comparable.
- **`props:false`** on a preset hides the pillars and beams, leaving the figure and floor grid.
- **Frame size, default lens, the figure and the surroundings** are plain three.js at the top of `scene.html`.
  Change the aspect ratio there, give the figure arms, add a second figure for over-the-shoulder shots, or animate
  the figure for tracking shots.
- **Clip length** is `D` in `presets.js`; **frame rate** is `--fps`.

What the scene does not do as shipped, so do not promise it from a reference clip: a moving subject (tracking,
leading), a second figure (over the shoulder), handheld shake and depth of field. Add them to the scene, or ask for
them in the prompt text.

## Prompt structure

The structure below came from comparing a long prompt and a five-sentence prompt on the same inputs: the long one
followed the reference second by second, the short one ignored it and did a generic push-in from the still's framing.

1. **Role of each input.** "Use Video 1 only as a camera-movement reference." Character, costume, scene and lighting
   follow Image 1. (Use the input names your model expects.)
2. **What not to copy.** "Video 1 shows a grey placeholder figure made of a box and a ball. Do not inherit the grey
   figure, pillars, beams or background."
3. **Timed beats that state the framing**, matching the keyframes: where the camera is, what it is aimed at, what is
   out of frame, in blocks of about two seconds. The opening beat matters most, because without it the model opens on
   the still's framing instead of the reference's.
4. **Subject pose and acting.** The blocks cannot act, so write it: stands still, looks down at the lens, expression.
   If the still shows a different pose from the one wanted, say the new pose explicitly.
5. **One continuous move, no cuts**, a sound line, then negatives.

Wording habits that help on any model: name the move, its speed and its direction together ("slow push-in", "fast
left-to-right truck"); one move per shot; in 9:16, push-ins, tilts, rises and orbits read better than wide sideways
moves.

## What testing has shown so far

A handful of single runs on one model (wan 3.0, November 2026). Treat these as leads to check on your own model, not
as rules.

- Rise, tilt, push-in and a full 360 orbit were followed closely, on the reference's timing.
- In the orbit, the pillars and beams leaked into the result as posts. With `props:false` the orbit still followed
  and nothing leaked. Close shots never showed the leak. Likely worth using `props:false` for any wide or sweeping
  move (orbit, arc, truck, pan, crane); only the orbit was actually tested.
- A constant camera roll (held dutch angle) did not transfer: the horizon stayed level and the subject leaned
  instead. A roll that changes during the shot did transfer. Say in the prompt that the camera rotates while the
  subject stays upright.
- The result tends to open a little wider than the reference.
- A scene still whose framing is close to the reference's first frame gives the tightest match.
- Fast whips and hard speed changes tend to be smoothed out; generate at normal speed and ramp in the edit.
