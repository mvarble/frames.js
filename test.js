/**
 * TEST: frame
 */
import chai from 'chai';
import chaiRoughly from 'chai-roughly';
import * as math from 'mathjs';
import {
  multiplyMatrixStack, 
  prepLoc, 
  prepVec, 
  prepArray,
  prepLocs, 
  prepVecs, 
  prepArrays,
  withChild,
  locFrameTrans,
  vecFrameTrans,
  locsFrameTrans,
  vecsFrameTrans,
  withWorldMatrix,
  normalizedFrame,
  transformedByMatrix,
  translatedFrame,
  rotatedFrame,
  scaledFrame,
} from './src';
import visit from 'unist-util-visit';
import cloneDeep from 'lodash/cloneDeep';

const expect = chai.expect;
const assert = chai.assert;
chai.use(chaiRoughly);

/**
 * original frame
 */
const babyFrame = { 
  type: 'frame',
  worldMatrix: math.matrix([[1, 0, 2], [0, 1, 1], [0, 0, 1]]),
  data: { 
    name: 'babyFrame',
  },
  children: [],
}
const frame2 = {
  type: 'frame',
  worldMatrix: math.matrix([[1, 2, -5], [1, -2, 8], [0, 0, 1]]),
  data: { 
    name: 'frame2',
  },
  children: [babyFrame],
};
const frame1 = {
  type: 'frame',
  worldMatrix: math.matrix([[1, 0, 0], [0, 1, -1], [0, 0, 1]]),
  data: { 
    name: 'frame1',
  },
  children: [],
}
const papaFrame = {
  type: 'frame',
  worldMatrix: math.matrix([[-1, 0, 1], [0, -2, 0], [0, 0, 1]]), 
  data: { 
    name: 'papaFrame',
  },
  children: [frame1, frame2],
};
const frame = {
  type: 'frame',
  worldMatrix: math.identity(3), 
  data: { name: 'main' },
  children: [papaFrame],
};
/**
 * [ 2 0 3 ] 
 * [ 0 1 4 ] 
 * [ 0 0 1 ] 
 * translate frame
 */
const babyFrameMat = { 
  type: 'frame',
  worldMatrix: math.matrix([[2, 0, 7], [0, 1, 5], [0, 0, 1]]),
  data: { 
    name: 'babyFrame',
  },
  children: [],
}
const frame2Mat = {
  type: 'frame',
  worldMatrix: math.matrix([[2, 4, -7], [1, -2, 12], [0, 0, 1]]),
  data: { 
    name: 'frame2',
  },
  children: [babyFrameMat],
};
const frame1Mat = {
  type: 'frame',
  worldMatrix: math.matrix([[2, 0, 3], [0, 1, 3], [0, 0, 1]]),
  data: { 
    name: 'frame1',
  },
  children: [],
}
const papaFrameMat = {
  type: 'frame',
  worldMatrix: math.matrix([[-2, 0, 5], [0, -2, 4], [0, 0, 1]]), 
  data: { 
    name: 'papaFrame',
  },
  children: [frame1Mat, frame2Mat],
};
const frameMat = {
  type: 'frame',
  worldMatrix: math.matrix([[2, 0, 3], [0, 1, 4], [0, 0, 1]]),
  data: {
    name: 'main' 
  },
  children: [papaFrameMat],
};

describe('Frame', () => {
  describe('#multiplyMatrixStack', () => {
    it('should multiply the array of matrices provided', () => {
      const array = multiplyMatrixStack([
        math.matrix([[1, 2, 3], [-1, 1, 0], [0, 4, -1]]),
        math.matrix([[0, 3, 3], [5, 3, 1], [1, 0, -8]]),
        math.matrix([[4, 2, 0], [-2, 6, 9], [6, 6, 0]])
      ]).valueOf();
      assert.deepEqual(array, [[-8, 94, 16], [27, -198, 189], [-6, 192, 66]]);
    });
  });
  describe('#prep*', () => {
    it('prepLoc: should turn an array to a location matrix', () => { 
      assert.deepEqual(prepLoc([0.4, -1]), math.matrix([[0.4], [-1], [1]]));
    });
    it('prepVec: should turn an array to a vector matrix', () => {
      assert.deepEqual(prepVec([0.4, -1]), math.matrix([[0.4], [-1], [0]]));
    });
    it('prepArray: should turn an array to a location matrix', () => {
      assert.deepEqual(prepArray(math.matrix([[0.5], [0.2], [1]])), [0.5, 0.2]);
    });
    it('prepLocs: should turn an array to a location matrix', () => { 
      assert.deepEqual(
        prepLocs([[0.4, -1], [0.9, 5], [6, 9]]), 
        math.matrix([[0.4, 0.9, 6], [-1, 5, 9], [1, 1, 1]])
      );
    });
    it('prepVecs: should turn an array to a vector matrix', () => {
      assert.deepEqual(
        prepVecs([[0.4, -1], [0.9, 5], [6, 9]]), 
        math.matrix([[0.4, 0.9, 6], [-1, 5, 9], [0, 0, 0]])
      );
    });
    it('prepArrays: should turn an array to a location matrix', () => {
      assert.deepEqual(
        prepArrays(math.matrix([[0.5, 0.4, 9], [0.2, -3, 6], [1, 1, 1]])), 
        [[0.5, 0.2], [0.4, -3], [9, 6]]
      );
    });
  });
  describe('#withChild', () => {
    it('should return a new frame', () => {
      const frameCopy = cloneDeep(frame);
      const child = { 
        type: 'frame',
        worldMatrix: math.identity(3),
        data: { children: [] },
      };
      const newFrame = withChild(frameCopy, child);
      assert.deepEqual(cleanedTree(frameCopy), cleanedTree(frame));
      frameCopy.children = [...frameCopy.children, child];
      assert.deepEqual(cleanedTree(newFrame), cleanedTree(frameCopy));
    });
  });
  describe('#locFrameTrans', () => {
    it( 'should transform location coordinates between frames', () => {
      expect(locFrameTrans([0, 0], frame, frame.children[0]))
        .to.roughly(0.0001).deep.equal([1, 0]);
      expect(locFrameTrans([-1, -2], frame, frame.children[0]))
        .to.roughly(0.0001).deep.equal([2, 1]);
      expect(locFrameTrans([1, -1], frame.children[0].children[0], frame))
        .to.roughly(0.0001).deep.equal([1, -2]);
    });
  });
  describe('#locsFrameTrans', () => {
    it( 'should transform location coordinates between frames', () => {
      expect(locsFrameTrans([[0, 0], [-1, -2]], frame, frame.children[0]))
        .to.roughly(0.0001).deep.equal([[1, 0], [2, 1]]);
    });
  });
  describe('#vecFrameTrans', () => {
    it( 'should transform vector coordinates between frames', () => {
      expect(vecFrameTrans([-1, -1], frame.children[0], frame))
        .to.roughly(0.0001).deep.equal([1, 2]);
      expect(vecFrameTrans([1, 2], frame, frame.children[0]))
        .to.roughly(0.0001).deep.equal([-1, -1]);
    });
  });
  describe('#vecsFrameTrans', () => {
    it( 'should transform vector coordinates between frames', () => {
      expect(vecsFrameTrans([[-1, -1], [3, 1]], frame.children[0], frame))
        .to.roughly(0.0001).deep.equal([[1, 2], [-3, -2]]);
    });
  });
  describe('#withWorldMatrix', () => {
    it('should update a frame and its children with the new matrix', () => {
      const newFrame = cloneDeep(frame);
      const movedFrame = withWorldMatrix(
        newFrame, 
        math.matrix([[2, 0, 3], [0, 1, 4], [0, 0, 1]])
      );
      assert.deepEqual(cleanedTree(newFrame), cleanedTree(frame));
      expect(movedFrame).to.roughly(0.0001).deep.equal(frameMat);
    });
  });
  describe('#normalizedFrame', () => {
    it('should update a frame by normalizing its basis', () => {
      const nFrame = normalizedFrame(frame2);
      const nFrameCheck = cloneDeep(frame2);
      nFrameCheck.worldMatrix = math.matrix([
        [1/math.sqrt(2), 1/math.sqrt(2), -5],
        [1/math.sqrt(2), -1/math.sqrt(2), 8],
        [0, 0, 1]
      ]);
      nFrameCheck.children[0].worldMatrix = math.matrix([
        [
          3 * math.pow(2, -2.5),
          math.pow(2, -2.5),
          -5+7/(2 * math.sqrt(2))
        ],
        [
          math.pow(2, -2.5),
          3 * math.pow(2, -2.5),
          8-7/(2 * math.sqrt(2))
        ],
        [0, 0, 1]
      ]);
      expect(cleanedTree(nFrame)).to.roughly(0.0001).deep.equal(cleanedTree(nFrameCheck));
    });
  });
  describe('#transformedByMatrix', () => {
    it('should return a transformed version of a frame', () => {
      const newFrame = cloneDeep(frame);
      const movedFrame = transformedByMatrix(
        newFrame, 
        math.matrix([[2, 0, 3], [0, 1, 4], [0, 0, 1]])
      );
      assert.deepEqual(cleanedTree(newFrame), cleanedTree(frame));
      expect(cleanedTree(movedFrame)).to.roughly(0.0001).deep.equal(cleanedTree(frameMat));
    });
  });
  describe('#rotatedFrame', () => {
    it('should return a rotated version of a frame', () => {
      const frame = {
        type: 'frame',
        worldMatrix: math.matrix([[1, 0., 9], [0., 1, -6], [0, 0, 1]]),
        data: {
        },
        children: [{
          type: 'frame',
          worldMatrix: math.matrix([[1, 1, 10], [-1, 1, -5], [0, 0, 1]]),
          data: {
          },
          chilren: []
        }]
      };
      const rFrame = rotatedFrame(frame, math.pi/4);
      const rFrame2 = rotatedFrame(
        frame.children[0], 
        math.pi/4, 
        { worldMatrix: math.matrix([[0, 1, 9], [-1, 0, -6], [0, 0, 1]]) }
      );
      const list = rFrame.worldMatrix.valueOf()
        .reduce((a, b) => [...a, ...b], []);
      const childList = rFrame.children[0].worldMatrix.valueOf()
        .reduce((a, b) => [...a, ...b], []).map(x => Math.round(100*x)/100.);
      const childList2 = rFrame2.worldMatrix.valueOf()
        .reduce((a, b) => [...a, ...b], []).map(x => Math.round(100*x)/100.);
      expect(list).to.roughly(1e-8).deep.equal([
        1/math.sqrt(2), -1/math.sqrt(2), 9, 
        1/math.sqrt(2), 1/math.sqrt(2), -6, 
        0, 0, 1
      ]);
      expect(childList).to.roughly.deep.eql([
        math.sqrt(2), 0., 9,
        0., math.sqrt(2), -6+math.sqrt(2),
        0, 0, 1
      ].map(x => Math.round(100*x)/100.));
      expect(childList2).to.roughly.deep.eql([
        math.sqrt(2), 0., 9,
        0., math.sqrt(2), -6+math.sqrt(2),
        0, 0, 1
      ].map(x => Math.round(100*x)/100.));
    });
  });
});

function cleanedTree(tree) {
  const treeCopy = cloneDeep(tree);
  if (treeCopy.worldMatrix) { treeCopy.worldMatrix = treeCopy.worldMatrix.valueOf(); }
  if (treeCopy.children) { treeCopy.children = treeCopy.children.map(cleanedTree); }
}
