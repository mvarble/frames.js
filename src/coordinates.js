/**
 * coordinates.js
 *
 * This module is responsible for all coordinate transformations between frames
 */

// module dependencies: project modules
import math from './math';

// the identity frame is that with the identity matrix as worldMatrix
const identityFrame = {
  type: 'frame',
  worldMatrix: math.identity(),
};
export { identityFrame };

// prep* methods map between (js array) <-> (mathjs matrix)
const prepLoc = arr => math.transpose([[...arr, 1]]);
const prepLocs = arr => math.transpose(arr.map(a => [...a, 1]));
const prepVec = arr => math.transpose([[...arr, 0]]);
const prepVecs = arr => math.transpose(arr.map(a => [...a, 0]));
const prepArray = mat => math.transpose(mat)[0].slice(0,-1);
const prepArrays = mat => math.transpose(mat).map(a => a.slice(0,-1));
export { prepLoc, prepLocs, prepVec, prepVecs, prepArray, prepArrays };

// this will generate the matrix which transfers between frames
const frameToFrameMatrix = (frame1, frame2) => (
  math.multiply(math.inv(frame2.worldMatrix), frame1.worldMatrix)
);
export { frameToFrameMatrix };

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
