# Required Assets for /public/

Place these files in this directory before running:

## 3D Model
- scene.gltf         — Your vintage radio 3D model with embedded animation clips
                       (crank animation should be the first/only clip)

## Audio Files
- estatica.mp3       — Static/white-noise radio interference sound (looped in State 1)
- intro_david.mp3    — Voice intro / radio signal (plays in State 2)
- disparo.mp3        — Gunshot / impact sound (plays on State 3 trigger)
- guia_ia.mp3        — AI guide voice (plays after explosion is complete in State 3)

## Mesh Name Hints
The RadioScene component auto-detects meshes via regex patterns.
Your GLTF mesh names should contain (case-insensitive):
  - Tuning knob:   "knob", "tuning_knob", "perilla", "dial"
  - Needle:        "needle", "indicator", "aguja", "pointer"
  - Tuning bar:    "tuning_bar", "bar", "barra", "yellow", "freq"
  - Antenna:       "antenna", "antena"
  - Circuit board: "pcb", "circuit", "board", "electronic"
  - Flashlight:    "flashlight", "torch", "led", "lamp", "light"
  - Chassis:       "chassis", "body", "carcasa", "shell", "case", "housing"
