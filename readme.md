# P5.js: OpenType

[Deutsch](README_DE.md)

Works directly with the [opentype.js](https://opentype.js.org) font that
sits underneath a p5 font: `font.getPath()` returns the raw path commands,
which are drawn as vector outline and sampled into points per contour. A
raster slider snaps the points to a grid. Gives more control over glyph
shapes than `textToPoints()`.

## Installation

Requirements: a current browser.

1. Open the folder in Visual Studio Code and start Live Server (click
   **Go Live** in the status bar).
2. Enter a text and adjust font size, sampling step, points per line and
   raster.
3. Press **O** to toggle the outlines.

To use another font, put the file (ttf/otf/woff) into `assets/` and change
`FONT_PATH` in `sketch.js`.

Libraries (in `libraries/`): p5.js 1.10.0, p5.sound 1.0.1 (included, not
used). opentype.js is part of p5.js and needs no extra file.

## Coding Help

- **`sketch.js` → globals**: `FONT_PATH` (default `assets/cmunrb.otf`) and
  the start values `sampleStep`, `fontSize`, `sampleLineSub` and
  `rasterSize`.
- **`preload()`**: loads the font with `loadFont()` and stores the
  opentype.js object (`theFont.font`) in `otFont`.
- **`setup()`**: connects the controls in `index.html` and calls
  `noLoop()` – every change triggers `regen()`, which only calls
  `redraw()`.
- **`draw()`**: gets the path with `otFont.getPath(text, x, y, fontSize)`.
  If `showOutlines` is on, it draws the commands `M`, `L`, `C`, `Q`, `Z`
  with `vertex()`, `bezierVertex()` and `quadraticVertex()`. Then it
  samples the path and draws one circle per point, snapped to a grid of
  `rasterSize` (which is also the circle diameter).
- **`pathhelper.js` → `sampleOpentypePath()`**: walks through the path
  commands, starts a new contour at each `M`, subdivides lines
  (`lineSub`) and samples curves in steps of `step` with `cubicAt()` /
  `quadAt()`. Returns a flat list of `{x, y, contour}` points.
- **`keyPressed()`**: **O** toggles the outlines. Note that typing an "o"
  in the text field toggles them as well.
- The contour/point counter in `index.html` (`#contCount`, `#ptCount`) is
  not updated by the code.
