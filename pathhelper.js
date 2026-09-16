// ---------- sampling helpers ----------
// cubic Bezier point at t
function cubicAt(t, p0, p1, p2, p3){
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const x = (mt2 * mt) * p0.x + 3 * (mt2) * t * p1.x + 3 * mt * t2 * p2.x + (t2 * t) * p3.x;
  const y = (mt2 * mt) * p0.y + 3 * (mt2) * t * p1.y + 3 * mt * t2 * p2.y + (t2 * t) * p3.y;
  return {x, y};
}

// quadratic Bezier point at t
function quadAt(t, p0, p1, p2){
  const mt = 1 - t;
  const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
  const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
  return {x, y};
}

// linear interpolation
function lerpPoint(p0, p1, t){
  return {x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t};
}


// Convert opentype.Path to contours of sampled points
function sampleOpentypePath(opPath, step=0.02, lineSub=1){
  const contoursOut = [];
  let current = null; // current contour {points: [], closed: bool}
  let pen = {x:0, y:0};
  for (let cmd of opPath.commands){
    if (cmd.type === 'M'){ // moveTo -> start new contour
      // finish previous
      if (current && current.points.length > 0) {
        contoursOut.push(current);
      }
      current = {points: [], closed: false};
      pen = {x: cmd.x, y: cmd.y};
      current.points.push({x: pen.x, y: pen.y});
    } else if (cmd.type === 'L'){ // lineTo
      const to = {x: cmd.x, y: cmd.y};
      // subdivide straight line if requested
      for (let s = 1; s <= lineSub; s++){
        const t = s / (lineSub + 1);
        const p = lerpPoint(pen, to, t);
        current.points.push(p);
      }
      current.points.push({x: to.x, y: to.y});
      pen = to;
    } else if (cmd.type === 'Q'){ // quadratic
      // cmd.x1,y1 control, cmd.x,y end
      const p0 = {x: pen.x, y: pen.y};
      const p1 = {x: cmd.x1, y: cmd.y1};
      const p2 = {x: cmd.x, y: cmd.y};
      // sample from t = step .. 1 inclusive (skip t=0 since pen already added)
      for (let t = step; t <= 1 + 1e-9; t += step){
        const tt = (t > 1) ? 1 : t;
        const p = quadAt(tt, p0, p1, p2);
        current.points.push(p);
      }
      pen = {x: cmd.x, y: cmd.y};
    } else if (cmd.type === 'C'){ // cubic
      // cmd.x1,y1, x2,y2, x,y
      const p0 = {x: pen.x, y: pen.y};
      const p1 = {x: cmd.x1, y: cmd.y1};
      const p2 = {x: cmd.x2, y: cmd.y2};
      const p3 = {x: cmd.x,  y: cmd.y};
      for (let t = step; t <= 1 + 1e-9; t += step){
        const tt = (t > 1) ? 1 : t;
        const p = cubicAt(tt, p0, p1, p2, p3);
        current.points.push(p);
      }
      pen = {x: cmd.x, y: cmd.y};
    } else if (cmd.type === 'Z' || cmd.type === 'z'){ // close
      current.closed = true;
      // ensure closure: accumulate a final point equal to the starting point if not present
      if (current.points.length > 0){
        const first = current.points[0];
        const last = current.points[current.points.length - 1];
        if (Math.abs(first.x - last.x) > 1e-6 || Math.abs(first.y - last.y) > 1e-6){
          current.points.push({x: first.x, y: first.y});
        }
      }
      // finish contour
      contoursOut.push(current);
      current = null;
    } else {
      // skip unknown commands
      console.warn('Unknown command:', cmd);
    }
  }
  // push trailing contour if not closed but has points
  if (current && current.points.length > 0){
    contoursOut.push(current);
  }
    // flattened points with contour index
  allPoints = [];
  contoursOut.forEach((c, ci) => {
    for (let p of c.points) {
      allPoints.push({x:p.x, y:p.y, contour:ci});
    }
  });
  return allPoints;
}
