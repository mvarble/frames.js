/**
 * transforms.js
 *
 * This is a module which exports functions corresponding to returning 
 * affine transforms of frames, includeing rigid body transforms and scaling.
 * Each map is designed to map through the children; i.e. if a frame is rotated,
 * each child is rotated relative to it.
 */

// module dependencies: npm packages
import cloneDeep from 'lodash/cloneDeep';
import visit from 'unist-util-visit';

// module dependencies: project modules
import math from './math';

// simply allows a giant product of matrices
function multiplyMatrixStack(array) {
  if (!array.length) {
    return math.identity();
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

// withChild will return a (shallow) copy of a frame with a prepended new child.
const withChild = (frame, child) => ({ 
  ...frame,
  children: [child, ...frame.children],
});
export { withChild };

// apply the appropriate affine transformation so that the provided frame 
// has the provided matrix as its `worldMatrix`
function withWorldMatrix(frame, matrix) {
  const newFrame = cloneDeep(frame);
  const oldMatrixInv = math.inv(newFrame.worldMatrix);
  visit(newFrame, (node, index, parent) => {
    if (parent && node.worldMatrix) {
      node.worldMatrix = multiplyMatrixStack([
        node.worldMatrix,
        oldMatrixInv,
        matrix
      ]);
    }
  });
  newFrame.worldMatrix = matrix;
  return newFrame;
}

function giveWorldMatrix(frame, matrix) {
  const oldMatrixInv = math.inv(frame.worldMatrix);
  visit(frame, (node, index, parent) => {
    if (parent && node.worldMatrix) {
      node.worldMatrix = multiplyMatrixStack([
        node.worldMatrix,
        oldMatrixInv,
        matrix
      ]);
    }
  });
  frame.worldMatrix = matrix;
  return frame;
}

export { withWorldMatrix, giveWorldMatrix };

// apply the scaling of a frame so that its basis vectors are (2-norm) normal
function normalizedMatrix(frame) {
  const array = frame.worldMatrix;
  const basis = [[array[0][0], array[1][0]], [array[0][1], array[1][1]]];
  const nBasis = basis.map(x => { 
    const N = math.norm(x);
    return x.map(y => y / N);
  });
  const matrix = [
    [...nBasis[0], array[0][2]],
    [...nBasis[1], array[1][2]],
    [0, 0, 1]
  ];
  return matrix;
}
function normalizedFrame(frame) {
  return withWorldMatrix(frame, normalizedMatrix(frame));
}
function normalizeFrame(frame) {
  return giveWorldMatrix(frame, normalizedMatrix(frame));
}
export { normalizedFrame, normalizeFrame };

// transform a frame by a matrix, relative to another
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
function transformWithMatrix(frame, matrix, relFrame) {
  if (relFrame) {
    return giveWorldMatrix(frame, multiplyMatrixStack([
      frame.worldMatrix,
      math.inv(relFrame.worldMatrix),
      matrix,
      relFrame.worldMatrix
    ]));
  } else {
    return giveWorldMatrix(frame, multiplyMatrixStack([
      matrix,
      frame.worldMatrix
    ]));
  }
}
export { transformedByMatrix, transformWithMatrix };

// translate a frame relative to another
const translatedFrame = (frame, vecCoord, relFrame) => transformedByMatrix(
  frame,
  [[1, 0, vecCoord[0]], [0 , 1, vecCoord[1]], [0, 0, 1]],
  relFrame
);
const translateFrame = (frame, vecCoord, relFrame) => transformWithMatrix(
  frame,
  [[1, 0, vecCoord[0]], [0 , 1, vecCoord[1]], [0, 0, 1]],
  relFrame
);
export { translatedFrame, translateFrame };

// rotate a frame relative to another
const rotatedFrame = (frame, theta, relFrame) => transformedByMatrix(
  frame,
  [
    [math.cos(theta), -math.sin(theta), 0], 
    [math.sin(theta), math.cos(theta), 0],
    [0, 0, 1]
  ],
  relFrame
);
const rotateFrame = (frame, theta, relFrame) => transformWithMatrix(
  frame,
  [
    [math.cos(theta), -math.sin(theta), 0], 
    [math.sin(theta), math.cos(theta), 0],
    [0, 0, 1]
  ],
  relFrame
);
export { rotatedFrame, rotateFrame };

// scale a frame relative to another
const scaledFrame = (frame, scales, relFrame) => transformedByMatrix(
  frame,
  [[scales[0], 0, 0], [0, scales[1], 0], [0, 0, 1]],
  relFrame
);
const scaleFrame = (frame, scales, relFrame) => transformWithMatrix(
  frame,
  [[scales[0], 0, 0], [0, scales[1], 0], [0, 0, 1]],
  relFrame
);
export { scaledFrame, scaleFrame };

// scale a frame so that its ordered basis (v1, v2) satisfies:
//   - ||v1||/||v2|| = ratio
//   - det(v1 v2) = det(old_v1 old_v2)
const ratioScale = (frame, ratio) => {
  const norms = math.transpose(frame.worldMatrix).reduce(
    (arr, row, i) => (i == 2) ? arr : [...arr, math.norm(row.slice(0,2))],
    [],
  );
  return math.pow(ratio * norms[1] / norms[0], 0.5);
}
const withRatio = (frame, ratio) => {
  const gamma = ratioScale(frame, ratio);
  return scaledFrame(
    frame,
    [gamma, 1/gamma]
  );
};
const giveRatio = (frame, ratio) => {
  const gamma = ratioScale(frame, ratio);
  return scaleFrame(
    frame,
    [gamma, 1/gamma]
  );
}
export { withRatio, giveRatio };
