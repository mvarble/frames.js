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

// withChild will return a copy of a frame with a prepended new child.
const withChild = (frame, child) => ({ 
  ...frame,
  children: [child, ...frame.children],
});
export { withChild };

// apply the appropriate affine transformation so that the provided frame 
// has the provided matrix as its `worldMatrix`
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

// apply the scaling of a frame so that its basis vectors are (2-norm) normal
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
export { transformedByMatrix };

// translate a frame relative to another
const translatedFrame = (frame, vecCoord, relFrame) => transformedByMatrix(
  frame,
  math.matrix([[1, 0, vecCoord[0]], [0 , 1, vecCoord[1]], [0, 0, 1]]),
  relFrame
);
export { translatedFrame };

// rotate a frame relative to another
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

// scale a frame relative to another
const scaledFrame = (frame, scales, relFrame) => transformedByMatrix(
  frame,
  math.matrix([[scales[0], 0, 0], [0, scales[1], 0], [0, 0, 1]]),
  relFrame
);
export { scaledFrame };

// scale a frame so that its ordered basis (v1, v2) satisfies:
//   - ||v1||/||v2|| = ratio
//   - det(v1 v2) = det(old_v1 old_v2)
const withRatio = (frame, ratio) => {
  const norms = math.transpose(frame.worldMatrix).valueOf().reduce(
    (arr, row, i) => (i == 2) ? arr : [...arr, math.norm(row.slice(0,2))],
    [],
  );
  const gamma = math.pow(ratio * norms[1] / norms[0], 0.5)
  return scaledFrame(
    frame,
    [gamma, 1/gamma]
  );
};
export { withRatio };
