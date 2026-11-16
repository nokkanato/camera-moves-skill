# Camera angle and movement catalogue

Contents: 1. Pick by feeling · 2. Angles · 3. Camera moves · 4. Lens moves · 5. Rig styles · 6. Time effects and
transitions (edit-side) · 7. Sources

Coordinates are for `camref/scene.html`: person at the origin facing +z, feet y=0, chest y≈1.2, head centre
y=1.62, metres. `pos` = camera position, `look` = point it aims at. Recipes are for a 6s clip in 9:16. The live
numbers are in `camref/presets.js` (preset names match the moves here, e.g. `push_in`, `orbit_360`, `angle_low`); if
the two disagree, presets.js wins.

**Status** records what happened when the reference was given to a video model. The entries so far are from a few
single runs on one model (wan 3.0, reference image + reference video, 480P/720P, November 2026). "untested" means the
grey clip renders correctly but has not been tried on any model. Add your own results, with the model name.

## 1. Pick by feeling

| The ask | Angle | Move |
|---|---|---|
| intimidating, powerful, boss, villain | low angle or worm's eye | low-angle rise, or slow push-in from below |
| small, weak, lonely, in trouble | high angle | slow pull-out or crane up |
| epic, grand, reveal the place | eye level to high | crane up, pull-out, aerial flyover |
| tense, something is wrong, unstable | dutch angle | slow push-in, or dolly zoom for the moment of shock |
| intimate, emotional, realisation | eye level | slow push-in to close-up |
| hero moment, show off the character | slightly low | arc or 360 orbit |
| energetic, hype, action | any | whip pan, crash zoom, FPV, fast truck |
| calm, neutral, let the acting play | eye level | static shot |
| cute, small creature's world | low, at the creature's eye height | static or gentle push-in |
| funny emphasis | eye level | crash zoom |

Low and high angles lose force when every shot uses them; come back to eye level between them. Pairing a low angle on
one character with a high angle on another shows who has the power.

## 2. Angles (where the camera sits; can be held static or combined with any move)

| Angle | What it is | Feeling | Recipe (static) | Prompt wording | Status |
|---|---|---|---|---|---|
| Eye level | Camera at the subject's eye height | Neutral, equal, relatable | pos (0,1.62,1.6) look (0,1.55,0) | "eye-level shot" | untested |
| Low angle | Camera below, looking up | Power, dominance, menace | pos (0,1.0,1.1) look (0,1.6,0) | "low-angle shot looking up at him" | wan 3.0: worked as the end of the low-angle rise |
| Worm's eye | Camera near the ground, looking steeply up | Towering size, intimidation | pos (0,0.12,1.3) look (0,1.5,0) | "extreme low angle from the ground, looking straight up" | untested |
| High angle | Camera above, looking down | Small, vulnerable, weak | pos (0,2.6,1.4) look (0,1.4,0) | "high-angle shot looking down on him" | untested |
| Bird's eye / overhead | Straight down from above | Overview, pattern, detachment | pos (0,3.6,0.05) look (0,0.6,0) | "overhead shot looking straight down" | untested |
| Dutch angle | Camera rolled so the horizon slants | Unease, chaos, tension | any pos/look plus roll 15 to 25 on every key | "dutch angle, tilted horizon" | wan 3.0: a constant roll (`dutch_push_in`) did NOT transfer; the horizon stayed level and the subject leaned instead. A roll that changes during the shot (`dutch_to_level_push_in`, 20° → 0°) did transfer. |
| Over the shoulder | Past one character's shoulder at another | Conversation, connection or confrontation | needs a second figure (not in the scene) | "over-the-shoulder shot from behind A, looking at B" | not built |
| POV | From a character's own eyes | Viewer is the character | pos at eye height of the viewer character, look at what they see | "POV shot, first person" | untested |

## 3. Camera moves (the camera body travels or pivots)

| Move | What the camera does | Feeling | Recipe (keys) | Prompt wording | Status |
|---|---|---|---|---|---|
| Static | Nothing; locked off | Calm, lets the action play | one pos/look on both keys | "fixed shot, camera locked on a tripod" | needs no reference clip |
| Pan | Pivots left/right in place | Following, revealing, scanning | pos (0,1.5,2.2) fixed; look x -1.5 → 1.5 at y 1.4 | "slow pan left to right" | untested |
| Tilt | Pivots up/down in place | Reveal height, size someone up | pos (0,1.2,1.6) fixed; look y 0.3 → 1.7 | "tilt up from his feet to his face" | untested |
| Roll | Rotates around the lens axis | Disorientation, dream | fixed pos/look; roll 0 → 180 | "camera rolls, horizon spins" | untested |
| Dolly in / push-in | Whole camera moves toward the subject | Pulls the viewer in, importance, realisation | pos z 2.4 → 0.9 at y 1.5; look (0,1.6,0) | "slow push-in toward his face" | untested |
| Dolly out / pull-out | Whole camera moves away | Isolation, ending, reveal of surroundings | reverse of push-in | "slow pull-out revealing the scene" | untested |
| Truck | Slides sideways, parallel to the scene | Travel, parallax, passing by | pos x -0.6 → 0.6 at (y 1.4, z 2.6); look x moves with pos x (wider travel puts the subject out of a 9:16 frame) | "camera trucks left to right" | untested |
| Pedestal | Rises or lowers straight, no tilt | Neutral reveal of height | pos y 0.5 → 1.7 at z 1.6; look y equals pos y | "camera rises straight up, staying level" | untested |
| **Low-angle rise** | Starts at waist height on the torso, rises and tilts up to a close low-angle on the face, creeps in | Intimidating reveal | t0 pos (0,0.80,0.95) look (0,1.00,0) · t4.5 pos (0,1.27,0.62) look (0,1.63,0) · t6 pos (0,1.29,0.55) look (0,1.63,0) | see `camref/prompt_template.txt` | wan 3.0: path and timing followed; opened wider than the reference |
| Crane up | Lifts high, usually tilting down | Scale, grandeur, leaving | pos (0,1.2,1.5) → (0,4,3.5); look (0,1.3,0) | "crane up and back, revealing the landscape" | untested |
| Crane down | Descends from high to the subject | Arrival, landing on the hero | reverse of crane up | "crane down from high above to land on him" | untested |
| Arc | Travels part-way around the subject | Suspended, shows a new side | radius 1.6, y 1.5: keys at 0°, 45°, 90° with pos (r·sin a, y, r·cos a); look (0,1.5,0); middle keys `ease:'linear'` | "camera arcs around him from front to side" | untested |
| 360 orbit | Full circle around the subject | Hero moment, showcase | as arc, a key every 45° through 360°, middle keys linear | "slow 360 orbit around him" | wan 3.0: full circle followed frame by frame, but the pillars and beams leaked into the result as posts. With `orbit_360_clean` (`props:false`) the orbit still followed and nothing leaked. |
| Tracking | Travels alongside a moving subject | Being with the character | needs a moving figure (not in the scene) | "tracking shot following alongside her" | not built |
| Leading | Moves backward in front of a subject walking to camera | Confidence, arrival | needs a moving figure | "camera leads him, moving backward as he walks forward" | not built |
| Aerial flyover | Glides forward high above | Establish place and size | pos (0,6,12) → (0,5,2); look ahead and down | "aerial drone flyover" | untested |
| FPV drone | Fast first-person flight that dives and weaves | High energy | multi-key path with banking roll; linear middle keys | "fast FPV drone shot diving toward him" | untested; expect smoothing |
| Whip pan | Very fast pivot that blurs | Energy, a snap of attention, a join between shots | look x sweeps -2 → 2 inside 0.3s | "whip pan" | untested; often better done in the edit |

## 4. Lens moves (camera body stays put; the `fov` key changes)

| Move | What happens | Feeling | Recipe | Prompt wording | Status |
|---|---|---|---|---|---|
| Zoom in | Lens narrows; picture enlarges with no parallax | Attention, observation | pos fixed; fov 55 → 25 | "slow zoom in" | untested |
| Zoom out | Lens widens | Context, release | fov 25 → 55 | "slow zoom out" | untested |
| Crash zoom | Sudden very fast zoom | Shock, comic emphasis | fov 55 → 22 inside 0.3s | "crash zoom onto his face" | untested |
| Dolly zoom (vertigo) | Camera moves one way while the lens zooms the other; subject stays the same size, background stretches | Dread, shock, the world shifting | pos z 2.6 → 1.0 with fov 28 → 66, both keys linear (keeps distance × tan(fov/2) roughly constant) | "dolly zoom, background stretches while he stays the same size" | untested |
| Rack focus | Focus shifts between near and far | Moves attention without a cut | not in the scene (no depth of field) | "rack focus from the foreground to him" | prompt only |

## 5. Rig styles (texture of the movement; mostly prompt-side)

| Style | Look | Feeling | How |
|---|---|---|---|
| Handheld | Slight natural shake | Real, urgent, documentary | prompt: "handheld camera, slight shake" (no shake in the scene) |
| Gimbal / steadicam | Smooth floating glide | Dreamy, polished | default look of camref easing; prompt: "smooth gimbal move" |
| Tripod | Rock steady | Calm, formal | static recipe; prompt: "locked-off tripod shot" |

## 6. Time effects and transitions (done in the edit, not with a camera reference)

| Effect | What it is | Where |
|---|---|---|
| Slow motion | Action slower than real time | edit; or prompt "slow motion" |
| Speed ramp | Speed changes within one shot, usually slowing on the key moment | edit |
| Freeze frame | Holds one moment | edit |
| Time-slice (bullet time) | Moment freezes while the camera keeps moving around it | orbit reference + prompt "everything frozen in time"; untested |
| Time-lapse / hyperlapse | Hours in seconds; hyperlapse also travels | prompt-side |
| Reverse | Plays backward | edit |
| Cut, jump cut, match cut, smash cut | Joins between shots | edit |
| Whip-pan join | Blur hides the cut | edit; end one piece and start the next on a fast pan |
| Dissolve, fade, wipe, morph | Soft or graphic joins | edit |
| J-cut / L-cut | Sound leads or trails the picture | edit |

## 7. Sources (researched 2026-11-16; definitions paraphrased)

- Morphic, camera movement reference for AI video (44 moves): https://morphic.com/resources/shots/camera-movements
- MasterClass, guide to camera moves: https://masterclass.com/articles/guide-to-camera-moves
- Artlist, essential camera movements: https://artlist.io/blog/camera-movements/
- Videomaker, camera movement techniques: https://www.videomaker.com/?p=16909
- PhotoWorkout, psychology of camera angles: https://www.photoworkout.com/camera-angles/
- Celtx, types of camera angles: https://blog.celtx.com/types-of-camera-angles-guide/
- Atlabs, AI camera move prompts: https://www.atlabs.ai/blog/ultimate-guide-ai-camera-moves-prompts
- Let's Enhance, camera movements in AI video: https://letsenhance.io/blog/all/ai-video-camera-movements/amp/

Notes on the sources: "arc" is used both for a curved dolly and for a partial orbit (this catalogue uses the orbit
meaning); "truck" is also called tracking or crab in some guides. No source gave model-specific camera vocabulary; the Status notes come only from
our own test renders.
