/**
 * TEST: frame
 */
const chai = require('chai');
const chaiRoughly = require('chai-roughly');
const math = require('mathjs');
const {
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
  giveWorldMatrix,
  normalizedFrame,
  transformedByMatrix,
  translatedFrame,
  rotatedFrame,
  withRatio,
  transpose,
  dot,
  multiply,
  inv,
} = require('./index');
const visit = require('unist-util-visit');
const cloneDeep = require('lodash/cloneDeep');

const expect = chai.expect;
const assert = chai.assert;
chai.use(chaiRoughly);

/**
 * original frame
 */
const babyFrame = { 
  type: 'frame',
  worldMatrix: [[1, 0, 2], [0, 1, 1], [0, 0, 1]],
  data: { 
    name: 'babyFrame',
  },
  children: [],
}
const frame2 = {
  type: 'frame',
  worldMatrix: [[1, 2, -5], [1, -2, 8], [0, 0, 1]],
  data: { 
    name: 'frame2',
  },
  children: [babyFrame],
};
const frame1 = {
  type: 'frame',
  worldMatrix: [[1, 0, 0], [0, 1, -1], [0, 0, 1]],
  data: { 
    name: 'frame1',
  },
  children: [],
}
const papaFrame = {
  type: 'frame',
  worldMatrix: [[-1, 0, 1], [0, -2, 0], [0, 0, 1]], 
  data: { 
    name: 'papaFrame',
  },
  children: [frame1, frame2],
};
const frame = {
  type: 'frame',
  worldMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 
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
  worldMatrix: [[2, 0, 7], [0, 1, 5], [0, 0, 1]],
  data: { 
    name: 'babyFrame',
  },
  children: [],
}
const frame2Mat = {
  type: 'frame',
  worldMatrix: [[2, 4, -7], [1, -2, 12], [0, 0, 1]],
  data: { 
    name: 'frame2',
  },
  children: [babyFrameMat],
};
const frame1Mat = {
  type: 'frame',
  worldMatrix: [[2, 0, 3], [0, 1, 3], [0, 0, 1]],
  data: { 
    name: 'frame1',
  },
  children: [],
}
const papaFrameMat = {
  type: 'frame',
  worldMatrix: [[-2, 0, 5], [0, -2, 4], [0, 0, 1]], 
  data: { 
    name: 'papaFrame',
  },
  children: [frame1Mat, frame2Mat],
};
const frameMat = {
  type: 'frame',
  worldMatrix: [[2, 0, 3], [0, 1, 4], [0, 0, 1]],
  data: {
    name: 'main' 
  },
  children: [papaFrameMat],
};

describe('Frame', () => {
  describe('Matrix Calculations', () => {
    describe('transpose', () => {
      it('should transpose an array that is in the form of a matrix', () => {
        expect(transpose([[0, 1, 2], [3, 4, 5]])).to.deep.equal([[0, 3], [1, 4], [2, 5]]);
        expect(transpose([[0, 1, 2]])).to.deep.equal([[0], [1], [2]]);
        expect(transpose([[0], [1], [2]])).to.deep.equal([[0, 1, 2]]);
      });
    });
    describe('dot', () => {
      it('should evaluate the dot product of two vectors of the same size', () => {
        expect(dot([0.5, 1, 3], [0.9, -1, 2.4])).to.equal(0.5 * 0.9 - 1 + 3 * 2.4);
      });
    });
    describe('multiply', () => {
      it('should be able to multiply matrices', () => {
        const M1 = [[0.4, 1.2, -1.1], [4, 3.3, 0], [-9, 1.1, 2]];
        const M2 = [[0.8, 2.1, 0.1], [-0.3, -0.1, 1], [2.1, 5.6, 7]];
        const v = [[0.1], [2.3], [-1]];
        expect(multiply(M1, M2)).to.deep.equal(math.multiply(M1, M2));
        expect(multiply(M1, v)).to.deep.equal(math.multiply(M1, v));
      })
    });
    describe('inv', () => {
      it('should be able to invert matrices', () => {
        const M1 = [[0.4, 1.2, -1.1], [4, 3.3, 0], [0, 0, 1]];
        expect(inv(M1)).to.roughly(0.0001).deep.equal(math.inv(M1));
      });
    });
  });
  describe('Coordinate Calculations', () => {
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
    describe('#prep*', () => {
      it('prepLoc: should turn an array to a location matrix', () => { 
        assert.deepEqual(prepLoc([0.4, -1]), [[0.4], [-1], [1]]);
      });
      it('prepVec: should turn an array to a vector matrix', () => {
        assert.deepEqual(prepVec([0.4, -1]), [[0.4], [-1], [0]]);
      });
      it('prepArray: should turn an array to a location matrix', () => {
        assert.deepEqual(prepArray([[0.5], [0.2], [1]]), [0.5, 0.2]);
      });
      it('prepLocs: should turn an array to a location matrix', () => { 
        assert.deepEqual(
          prepLocs([[0.4, -1], [0.9, 5], [6, 9]]), 
          [[0.4, 0.9, 6], [-1, 5, 9], [1, 1, 1]]
        );
      });
      it('prepVecs: should turn an array to a vector matrix', () => {
        assert.deepEqual(
          prepVecs([[0.4, -1], [0.9, 5], [6, 9]]), 
          [[0.4, 0.9, 6], [-1, 5, 9], [0, 0, 0]]
        );
      });
      it('prepArrays: should turn an array to a location matrix', () => {
        assert.deepEqual(
          prepArrays([[0.5, 0.4, 9], [0.2, -3, 6], [1, 1, 1]]), 
          [[0.5, 0.2], [0.4, -3], [9, 6]]
        );
      });
    });
  });
  describe('Frame Transformations', () => {
    describe('#multiplyMatrixStack', () => {
      it('should multiply the array of matrices provided', () => {
        const array = multiplyMatrixStack([
          [[1, 2, 3], [-1, 1, 0], [0, 4, -1]],
          [[0, 3, 3], [5, 3, 1], [1, 0, -8]],
          [[4, 2, 0], [-2, 6, 9], [6, 6, 0]],
        ]);
        assert.deepEqual(array, [[-8, 94, 16], [27, -198, 189], [-6, 192, 66]]);
      });
    });
    describe('#withWorldMatrix', () => {
      it('should update a frame and its children with the new matrix', () => {
        const newFrame = cloneDeep(frame);
        const movedFrame = withWorldMatrix(
          newFrame, 
          [[2, 0, 3], [0, 1, 4], [0, 0, 1]]
        );
        assert.deepEqual(newFrame, frame);
        expect(movedFrame).to.roughly(0.0001).deep.equal(frameMat);
      });
    });
    describe('#normalizedFrame', () => {
      it('should update a frame by normalizing its basis', () => {
        const nFrame = normalizedFrame(frame2);
        const nFrameCheck = cloneDeep(frame2);
        nFrameCheck.worldMatrix = [
          [1/math.sqrt(2), 1/math.sqrt(2), -5],
          [1/math.sqrt(2), -1/math.sqrt(2), 8],
          [0, 0, 1]
        ];
        nFrameCheck.children[0].worldMatrix = [
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
        ];
        expect(nFrame).to.roughly(0.0001).deep.equal(nFrameCheck);
      });
    });
    describe('#transformedByMatrix', () => {
      it('should return a transformed version of a frame', () => {
        const newFrame = cloneDeep(frame);
        const movedFrame = transformedByMatrix(
          newFrame, 
          [[2, 0, 3], [0, 1, 4], [0, 0, 1]]
        );
        assert.deepEqual(newFrame, frame);
        expect(movedFrame).to.roughly(0.0001).deep.equal(frameMat);
      });
    });
    describe('#rotatedFrame', () => {
      it('should return a rotated version of a frame', () => {
        const frame = {
          type: 'frame',
          worldMatrix: [[1, 0., 9], [0., 1, -6], [0, 0, 1]],
          data: {
          },
          children: [{
            type: 'frame',
            worldMatrix: [[1, 1, 10], [-1, 1, -5], [0, 0, 1]],
            data: {
            },
            chilren: []
          }]
        };
        const rFrame = rotatedFrame(frame, math.pi/4);
        const rFrame2 = rotatedFrame(
          frame.children[0], 
          math.pi/4, 
          { worldMatrix: [[0, 1, 9], [-1, 0, -6], [0, 0, 1]] }
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
    describe('#withRatio', () => {
      it('should scale frame to have certain ratio and same determinant', () => {
        const frame = { 
          type: 'frame', 
          worldMatrix: [[0.5, 2.5, -4.58], [3.2, -1.6, 2], [0, 0, 1]],
        };
        const newFrame = withRatio(frame, 5.0)
        const frameDet = frame => {
          const M = frame.worldMatrix.valueOf();
          return M[0][0] * M[1][1] - M[1][0] * M[0][1];
        };
        const M = math.transpose(newFrame.worldMatrix).valueOf();
        const ratio = math.norm(M[0].slice(0,2)) / math.norm(M[1].slice(0,2));
        expect(frameDet(newFrame)).to.roughly(0.0001).equal(frameDet(frame));
        expect(Math.round(ratio*100)/100).to.roughly(0.0001).equal(5.0);
      });
    });
    describe('#giveWorldMatrix', () => {
      it('should manipulate the frame so that it is identical to the output of `withWorldMatrix`', () => {
        const frame = {
          type: 'frame',
          worldMatrix: [[1, 0., 9], [0., 1, -6], [0, 0, 1]],
          data: {
          },
          children: [{
            type: 'frame',
            worldMatrix: [[1, 1, 10], [-1, 1, -5], [0, 0, 1]],
            data: {
            },
            chilren: []
          }]
        };
        const matrix = [[12, -12, 5], [12, 12, 13], [0, 0, 1]];
        const transformed = withWorldMatrix(frame, matrix);
        giveWorldMatrix(frame, matrix);
        expect(frame).to.roughly.deep.equal(transformed);
      });
    });
  });
});
