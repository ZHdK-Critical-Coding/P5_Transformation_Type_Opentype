# P5.js: OpenType

[English](readme.md)

Arbeitet direkt mit der [opentype.js](https://opentype.js.org)-Schrift,
die unter einer p5-Schrift liegt: `font.getPath()` liefert die rohen
Pfadbefehle, die als Vektorkontur gezeichnet und pro Kontur in Punkte
abgetastet werden. Ein Raster-Slider rastet die Punkte auf ein Gitter ein.
Gibt mehr Kontrolle über Glyphenformen als `textToPoints()`.

## Installation

Voraussetzungen: ein aktueller Browser.

1. Den Ordner in Visual Studio Code öffnen und Live Server starten (in der
   Statusleiste auf **Go Live** klicken).
2. Einen Text eingeben und Schriftgrösse, Abtastschritt, Punkte pro Linie
   und Raster einstellen.
3. **O** drücken, um die Konturen ein- und auszublenden.

Für eine andere Schrift die Datei (ttf/otf/woff) in `assets/` legen und
`FONT_PATH` in `sketch.js` ändern.

Bibliotheken (in `libraries/`): p5.js 1.10.0, p5.sound 1.0.1 (eingebunden,
nicht verwendet). opentype.js ist in p5.js enthalten und braucht keine
eigene Datei.

## Coding-Hilfe

- **`sketch.js` → globale Variablen**: `FONT_PATH` (Standard
  `assets/cmunrb.otf`) und die Startwerte `sampleStep`, `fontSize`,
  `sampleLineSub` und `rasterSize`.
- **`preload()`**: lädt die Schrift mit `loadFont()` und speichert das
  opentype.js-Objekt (`theFont.font`) in `otFont`.
- **`setup()`**: verbindet die Bedienelemente aus `index.html` und ruft
  `noLoop()` auf – jede Änderung löst `regen()` aus, das nur `redraw()`
  aufruft.
- **`draw()`**: holt den Pfad mit `otFont.getPath(text, x, y, fontSize)`.
  Ist `showOutlines` aktiv, werden die Befehle `M`, `L`, `C`, `Q`, `Z` mit
  `vertex()`, `bezierVertex()` und `quadraticVertex()` gezeichnet. Danach
  wird der Pfad abgetastet und pro Punkt ein Kreis gezeichnet, eingerastet
  auf ein Gitter der Grösse `rasterSize` (das ist auch der
  Kreisdurchmesser).
- **`pathhelper.js` → `sampleOpentypePath()`**: geht die Pfadbefehle
  durch, beginnt bei jedem `M` eine neue Kontur, unterteilt Linien
  (`lineSub`) und tastet Kurven in Schritten von `step` mit `cubicAt()` /
  `quadAt()` ab. Gibt eine flache Liste von `{x, y, contour}`-Punkten
  zurück.
- **`keyPressed()`**: **O** blendet die Konturen ein und aus. Achtung: Ein
  "o" im Textfeld schaltet sie ebenfalls um.
- Der Konturen-/Punktezähler in `index.html` (`#contCount`, `#ptCount`)
  wird vom Code nicht aktualisiert.
