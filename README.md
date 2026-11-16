# camera-moves

A Claude skill for camera work in AI video: a catalogue of camera angles and moves, a small three.js tool that renders
any of them as a grey block-figure reference clip, and a prompt structure that makes a video model follow the clip.

It is a framework, not a finished pipeline. It has no video-model client; bring your own.

## Install

Clone into your Claude skills folder so the folder is named `camera-moves`.

macOS / Linux:

```bash
git clone https://github.com/nokkanato/camera-moves-skill.git ~/.claude/skills/camera-moves
```

Windows (PowerShell):

```powershell
git clone https://github.com/nokkanato/camera-moves-skill.git "$env:USERPROFILE\.claude\skills\camera-moves"
```

Then set up the renderer once (needs Node 18+ and ffmpeg on PATH):

```bash
cd camref
npm install
npx playwright install chromium
node render.mjs --preset push_in
```

Start a new Claude session and ask for a camera move.

## Contents

- `SKILL.md` - workflow, tool usage, prompt structure, test notes
- `references/catalogue.md` - angles, moves, lens moves, what each feels like, keyframe recipes
- `camref/scene.html` - the three.js scene (figure, floor grid, pillars, beams)
- `camref/presets.js` - camera paths as keyframes; add your own here
- `camref/render.mjs` - renders a preset to MP4
- `camref/prompt_template.txt` - prompt skeleton plus one filled example
