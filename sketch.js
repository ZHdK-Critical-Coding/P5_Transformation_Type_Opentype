
/*
  p5 + opentype.js example
  - Loads a TTF/OTF using opentype.js
  - Uses font.getPath(text, x, y, fontSize) to get raw commands
  - Samples each path command into points. Groups by contour.
  - Draws outline and sampled points.
*/

const FONT_PATH = 'assets/cmunrb.otf'; // <<-- put your font file here
let otFont = null;               // opentype.Font
let contours = [];               // array of {points: [{x,y}], closed: bool}
let allPoints = [];              // flat array of points with contour index
let showOutlines = true;
let sampleStep = 0.02;           // t step for sampling curves (0.01 -> ~100 points per curve)
let fontSize = 300;
let sampleLineSub = 1;           // subdivisions for straight lines
let rasterSize = 1;


function preload(){
  // loadFont needs a font file (ttf/otf/woff). Replace FONT_PATH with your file.
  // If loadFont fails you'll get an error in the console and the sketch won't show glyph outlines.
  theFont = loadFont(FONT_PATH, () => {
    otFont = theFont.font
  });
}


function setup(){
  createCanvas(windowWidth, windowHeight);
  noLoop();
  // UI hookups
  select('#fontPath').html(FONT_PATH);
  const sampleStepInput = select('#sampleStep');
  const fontSizeInput = select('#fontSize');
  const textInput = select('#textInput');
  const regenBtn = select('#regenBtn');
  const lineSubIn = select('#lineSubIn');
  const rasterIn = select('#rasterIn');

  sampleStepInput.input(()=>{ sampleStep = parseFloat(sampleStepInput.value()); select('#stepVal').html(sampleStep); regen(); });
  fontSizeInput.input(()=>{ fontSize = parseInt(fontSizeInput.value()); select('#fsVal').html(fontSize); regen(); });
  lineSubIn.input(()=>{ sampleLineSub = parseInt(lineSubIn.value()); select('#lineSub').html(sampleLineSub); regen(); });

  rasterIn.input(()=>{ rasterSize = parseInt(rasterIn.value()); select('#raster').html(rasterSize); regen(); });

  textInput.input(()=> regen());
  regenBtn.mousePressed(()=> regen());
}

function regen(){
  redraw()
}

function windowResized(){ 
  resizeCanvas(windowWidth, windowHeight); 
  regen(); 
}


function draw(){
  background(22);

  if (!otFont){
    fill(200); noStroke();
    textSize(16);
    text('Loading font (opentype.js) - make sure ' + FONT_PATH + ' exists and you run via http(s) or local server', 20, 40);
    return;
  }

  // draw bounding box for visual ease

  const txt = select('#textInput').value() || 'ZHDK';
  const margin = 60;  
  const x = margin;
  const y = height / 2 + fontSize / 3;

  // Draw outlines (original vector)
  const path = otFont.getPath(txt, x, y, fontSize);

  if (showOutlines){
    noFill();
    stroke(90, 180, 255, 180);
    strokeWeight(1.5);
    // We can't directly feed opentype commands into beginShape with bezierVertex easily across contours,
    // so reconstruct by iterating the path again and using vertex / bezierVertex.
    // Use otFont.getPath to get commands positioned as in regen

    // We'll draw contour-by-contour:
     for (let cmd of path.commands) {
      if (cmd.type === "M") {
        beginShape();
        vertex(cmd.x, cmd.y);
      } else if (cmd.type === "L") {
        vertex(cmd.x, cmd.y);
      } else if (cmd.type === "C") {
        bezierVertex(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
      } else if (cmd.type === "Q") {
        quadraticVertex(cmd.x1, cmd.y1, cmd.x, cmd.y);
      } else if (cmd.type === "Z") {
        endShape(CLOSE);
      }
    }
  }

  points = sampleOpentypePath(path, sampleStep, sampleLineSub)
  // update the counters in index.html (each point knows its contour index)
  const contourCount = points.length > 0 ? points[points.length - 1].contour + 1 : 0;
  select('#contCount').html(contourCount);
  select('#ptCount').html(points.length);

  // draw sampled points
  fill(255);
  noStroke();
  for (let i = 0; i < points.length; i++){
    const p = points[i];
    circle(Math.floor(p.x / rasterSize) * rasterSize + rasterSize * .5, Math.floor(p.y / rasterSize) * rasterSize + rasterSize * .5, rasterSize);
  }
}


// keyboard shortcuts
function keyPressed(){
  // ignore shortcuts while typing in the text field
  if (document.activeElement === select('#textInput').elt) return;
  if (key === 'o' || key === 'O') {
    showOutlines = !showOutlines;
    redraw();
  }
}

// initial regen wrapper
function initialRegenIfLoaded(){
  if (otFont) regen();
}

// force initial loop in case font loads after setup
setTimeout(initialRegenIfLoaded, 250);
