/**
 * math.js
 *
 * This creates some math functions for operations we need throughout.
 */

function identity() {
  return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
}

function transpose(M) {
  const cols = [ ...new Array(M[0].length) ];
  const rows = [ ...new Array(M.length) ];
  return cols.map((_, j) => rows.map((_, i) => M[i][j]));
}

function dot(v1, v2) {
  return v1.reduce((s, v, i) => s + v*v2[i], 0);
}

function multiply(M1, M2) {
  const M2T = transpose(M2);
  const cols = [ ...new Array(M2T.length) ];
  return M1.reduce(
    (M, row) => [ ...M, cols.map((_, i) => dot(row, M2T[i]))],
    []
  );
}

function basisDet(M) {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0];
}

function inv(M) {
  const D = basisDet(M);
  return multiply(
    [
      [M[1][1]/D, -M[0][1]/D, 0],
      [-M[1][0]/D, M[0][0]/D, 0],
      [0, 0, 1]
    ],
    [
      [1, 0, -M[0][2]],
      [0, 1, -M[1][2]],
      [0, 0, 1],
    ]
  );
}

function pow(a, b) {
  return Math.pow(a, b);
}

function sin(a) {
  return Math.sin(a);
}

function cos(a) {
  return Math.cos(a);
}

function norm(v) {
  return pow(v.reduce((s, x) => s + x * x, 0), 0.5);
}

export {
  identity,
  transpose,
  dot,
  multiply,
  inv,
  pow,
  sin,
  cos,
  norm,
}

export default {
  identity,
  transpose,
  dot,
  multiply,
  inv,
  pow,
  sin,
  cos,
  norm,
};
