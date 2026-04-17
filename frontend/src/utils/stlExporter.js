/**
 * STL Exporter Utility
 * Takes 2D airfoil coordinates and extrudes them into a 3D wing section,
 * outputting a valid ASCII STL string for 3D printing.
 */

/**
 * Compute the normal vector for a triangle defined by three vertices.
 */
const computeNormal = (v0, v1, v2) => {
  const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
  const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
};

/**
 * Fan-triangulate a polygon (array of [x,y,z] points) from the first vertex.
 * Returns an array of triangles, each triangle is [v0, v1, v2].
 */
const fanTriangulate = (polygon) => {
  const tris = [];
  for (let i = 1; i < polygon.length - 1; i++) {
    tris.push([polygon[0], polygon[i], polygon[i + 1]]);
  }
  return tris;
};

/**
 * Generate an ASCII STL string from 2D airfoil points.
 *
 * @param {Array<[number,number]>} points - The 2D airfoil coordinates (x, y).
 *   These are assumed to be normalised to chord = 1, centred around x=0.
 * @param {number} chordMM - Desired chord length in millimetres.
 * @param {number} spanMM  - Desired wingspan (extrusion depth) in millimetres.
 * @returns {string} ASCII STL file content.
 */
export const generateAirfoilSTL = (points, chordMM = 100, spanMM = 150) => {
  if (!points || points.length < 3) {
    throw new Error('Need at least 3 points to generate STL');
  }

  // Scale factor: the input points have chord ≈ 1 (from -0.5 to 0.5).
  // We need to scale them to the desired chord in mm.
  const scale = chordMM;
  const halfSpan = spanMM / 2;

  // Build the two end-cap polygons (front face at z = -halfSpan, back face at z = +halfSpan)
  const frontFace = points.map(([x, y]) => [x * scale, y * scale, -halfSpan]);
  const backFace  = points.map(([x, y]) => [x * scale, y * scale,  halfSpan]);

  const triangles = [];

  // 1. Front endcap (normal pointing towards -Z)
  const frontTris = fanTriangulate(frontFace);
  // Reverse winding so normal faces outward (-Z)
  for (const [a, b, c] of frontTris) {
    triangles.push([a, c, b]);
  }

  // 2. Back endcap (normal pointing towards +Z)
  const backTris = fanTriangulate(backFace);
  for (const tri of backTris) {
    triangles.push(tri);
  }

  // 3. Side walls (connecting front and back faces)
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const fl = frontFace[i]; // front-left
    const fr = frontFace[j]; // front-right
    const bl = backFace[i];  // back-left
    const br = backFace[j];  // back-right

    // Two triangles per quad
    triangles.push([fl, fr, br]);
    triangles.push([fl, br, bl]);
  }

  // Build ASCII STL
  let stl = 'solid airfoil\n';
  for (const [v0, v1, v2] of triangles) {
    const [nx, ny, nz] = computeNormal(v0, v1, v2);
    stl += `  facet normal ${nx.toExponential(6)} ${ny.toExponential(6)} ${nz.toExponential(6)}\n`;
    stl += '    outer loop\n';
    stl += `      vertex ${v0[0].toExponential(6)} ${v0[1].toExponential(6)} ${v0[2].toExponential(6)}\n`;
    stl += `      vertex ${v1[0].toExponential(6)} ${v1[1].toExponential(6)} ${v1[2].toExponential(6)}\n`;
    stl += `      vertex ${v2[0].toExponential(6)} ${v2[1].toExponential(6)} ${v2[2].toExponential(6)}\n`;
    stl += '    endloop\n';
    stl += '  endfacet\n';
  }
  stl += 'endsolid airfoil\n';

  return stl;
};

/**
 * Trigger a browser download of the generated STL file.
 */
export const downloadSTL = (stlContent, filename = 'airfoil.stl') => {
  const blob = new Blob([stlContent], { type: 'application/sla' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
