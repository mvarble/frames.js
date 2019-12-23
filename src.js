/**
 * src.js
 *
 * This is a module which exports functions corresponding to operating on 
 * `frames` which correspond to unist trees of matrices which can be 
 * interpreted as coordinate systems in the plane.
 */

// module dependencies: npm packages
import * as math from 'mathjs';
import cloneDeep from 'lodash/cloneDeep';
import visit from 'unist-util-visit';

// start building the module default export
let out = {};

// simply allows a giant product
function multiplyMatrixStack(array) {
  if (!array.length) {
    return math.identity(3);
  } else if (array.length == 1) {
    return array[0];
  } else if (array.length == 2) {
    return math.multiply(array[1], array[0]);
  } else {
    return math.multiply(
      array.slice(-1)[0], 
      multiplyMatrixStack(array.slice(0, -1))
    );
  }
}
export { multiplyMatrixStack };
out = { ...out, multiplyMatrixStack };

// these will prep mathjs <-> js objects accordingly
const prepLoc = array => math.transpose(math.matrix([[...array, 1]]));
const prepLocs = array => math.transpose(math.matrix(
  array.map(a => [...a, 1])
));
const prepVec = array => math.transpose(math.matrix([[...array, 0]]));
const prepVecs = array => math.transpose(math.matrix(
  array.map(a => [...a, 0])
));
const prepArray = matrix => math.transpose(matrix).valueOf()[0].slice(0,-1);
const prepArrays = matrix => math.transpose(matrix).valueOf()
  .map(a => a.slice(0,-1));
export { prepLoc, prepLocs, prepVec, prepVecs, prepArray, prepArrays };
out = { ...out, prepLoc, prepLocs, prepVec, prepVecs, prepArray, prepArrays }; 

// this will simply append a child to the front of an array
const withChild = (frame, child) => ({ 
  ...frame,
  children: [child, ...frame.children],
});
export { withChild };
out = { ...out, withChild };

// this will generate the matrix which transfers between frames
const frameToFrameMatrix = (frame1, frame2) => (
  math.multiply(math.inv(frame2.worldMatrix), frame1.worldMatrix)
);
export { frameToFrameMatrix };
out = { ...out, frameToFrameMatrix };

// these will convert `frame1` location coordinates to those of `frame2`
const locFrameTrans = (coords, frame1, frame2) => (
  prepArray(
    math.multiply(
      frameToFrameMatrix(frame1, frame2),
      prepLoc(coords)
    )
  )
);
const locsFrameTrans = (coordsArray, frame1, frame2) => (
  prepArrays(
    math.multiply(
      frameToFrameMatrix(frame1, frame2),
      prepLocs(coordsArray)
    )
  )
);
export { locFrameTrans, locsFrameTrans };
out = { ...out, locFrameTrans, locsFrameTrans };

// these will convert `frame1` vector coordinates to those of `frame2`
const vecFrameTrans = (coords, frame1, frame2) => (
  prepArray(
    math.multiply(
      frameToFrameMatrix(frame1, frame2),
      prepVec(coords)
    )
  )
);
const vecsFrameTrans = (coordsArray, frame1, frame2) => (
  prepArrays(
    math.multiply(
      frameToFrameMatrix(frame1, frame2),
      prepVecs(coordsArray)
    )
  )
);
export { vecFrameTrans, vecsFrameTrans };
out = { ...out, vecFrameTrans, vecsFrameTrans };

// this will output a frame in which the inputted one was transformed to get the
// new matrix (children affected)
function withWorldMatrix(frame, matrix) {
  const newFrame = cloneDeep(frame);
  const oldMatrix = newFrame.worldMatrix;
  visit(newFrame, (node, index, parent) => {
    if (parent && node.worldMatrix) {
      parent.children[index].worldMatrix = multiplyMatrixStack([
        node.worldMatrix,
        math.inv(oldMatrix),
        matrix
      ]);
    }
  });
  newFrame.worldMatrix = matrix;
  return newFrame;
}
export { withWorldMatrix };
out = { ...out, withWorldMatrix };

// this will return a copy of the inputted frame, transformed so that its basis
// is normalized
function normalizedFrame(frame) {
  const array = frame.worldMatrix.valueOf();
  const basis = [[array[0][0], array[1][0]], [array[0][1], array[1][1]]];
  const nBasis = basis.map(x => math.multiply(x, 1/math.norm(x)));
  const matrix = math.matrix([
    [...nBasis[0], array[0][2]],
    [...nBasis[1], array[1][2]],
    [0, 0, 1]
  ]);
  return withWorldMatrix(frame, matrix);
}
export { normalizedFrame };
out =  { ...out, normalizedFrame };

// this will enact a transformation of a frame `frame` via the matrix `matrix`, 
// relative to `relFrame`.
function transformedByMatrix(frame, matrix, relFrame) {
  if (relFrame) {
    return withWorldMatrix(frame, multiplyMatrixStack([
      frame.worldMatrix,
      math.inv(relFrame.worldMatrix),
      matrix,
      relFrame.worldMatrix
    ]));
  } else {
    return withWorldMatrix(frame, multiplyMatrixStack([
      matrix,
      frame.worldMatrix
    ]));
  }
}
export { transformedByMatrix };
out = { ...out, transformedByMatrix };

// this is a wrapper by `transformedByMatrix` in which the transformation is
// a translation
const translatedFrame = (frame, vecCoord, relFrame) => transformedByMatrix(
  frame,
  math.matrix([[1, 0, vecCoord[0]], [0 , 1, vecCoord[1]], [0, 0, 1]]),
  relFrame
);
export { translatedFrame };
out =  { ...out, translatedFrame };

// this is a wrapper by `transformedByMatrix` in which the transformation is
// a rotation
const rotatedFrame = (frame, theta, relFrame) => transformedByMatrix(
  frame,
  math.matrix([
    [math.cos(theta), -math.sin(theta), 0], 
    [math.sin(theta), math.cos(theta), 0],
    [0, 0, 1]
  ]),
  relFrame
);
export { rotatedFrame };
out = { ...out, rotatedFrame };

// this is a wrapper by `transformedByMatrix` in which the transformation is
// a scale
const scaledFrame = (frame, scales, relFrame) => transformedByMatrix(
  frame,
  math.matrix([[scales[0], 0, 0], [0, scales[1], 0], [0, 0, 1]]),
  relFrame
);
export { scaledFrame };
out = { ...out, scaledFrame };

// this simply returns the determinant of the basis vectors in the frame
const frameDet = frame => {
  const M = frame.worldMatrix.valueOf();
  return M[0][0] * M[1][1] - M[1][0] * M[0][1];
};
out = { ...out, frameDet };

// this returns a transformed version of the frame, in which the basis vectors
// will be scaled to have an inputted ratio (determinant fixed)
const withRatio = (frame, ratio) => {
  const sqrtJac = math.sqrt(math.abs(frameDet(frame)));
  return scaledFrame(
    normalizedFrame(frame),
    [sqrtJac * ratio, sqrtJac]
  );
};
export { withRatio };
out = { ...out, withRatio };

// this is here if we include it in the browser
try {
  window.frames = out;
} catch (e) {}
