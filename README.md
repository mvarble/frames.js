# frames.js

A set of tools for working with coordinate systems in the plane.

## Download

```
npm install frames
```

## The Mathematics

One can simply encode affine coordinate systems in the plane by 3x3 *frame* matrices.
This way, calculations like rigid body transformations and coordinate transforms can be streamlined into simple matrix multiplication calculations.
The purpose of this module is to wrap all such calculations into simple functions by utilizing the [mathjs](https://github.com/josdejong/mathjs) library.

## The Code

Because we would sometimes like a frame relative to another, it is very natural to store our frames in a tree structure.
To this end, a frame is nothing but a JSON object which has `worldMatrix` and `children` fields.
Because frames are created primarily for rendering to the HTML canvas, one should be able to easily search through all the frames within a given context and access any sort of metadata each frame has.
It is then decided that the objects will behave like [unist](https://github.com/syntax-tree/unist) trees.
Consider the example below.

```js
const pixelFrame = { type: 'frame', worldMatrix: math.identity(3) };

const planeFrame = {
  type: 'frame',
  worldMatrix: math.matrix([[10, 0, 400], [0, -10, 400], [0, 0, 1]]),
};

const domFrame = { 
  type: 'frame',
  worldMatrix: math.matrix([[400, 0, 400], [0, -300, 300], [0, 0, 1]]),
  children: [planeFrame],
};

const entireTree = {
  type: 'root',
  children: [pixelFrame, domFrame]
};
```

Since our frames are encoded with simple JSON objects, the magic of the module is in the functions which parse/generate frames.
**Every function exported by this module is pure**, as most of them are simple mathematical transformations.

## API

Since this is a small package, one can look at the source code.
Otherwise, for the most part, there are only several functions which are very useful.

### Rigid-Body Transformations

If one would like to return a translated/rotated/scaled version of a frame, it is as simple as using the following functions.

- **translatedFrame(frame, disp [, relativeFrame])**: This will return a frame which corresponds to translating `frame` by `[disp[0], disp[1]]` in the coordinate system of `relativeFrame`. The `relativeFrame` will be `frame` if not provided.
- **rotatedFrame(frame, theta, [, relativeFrame])**: This will return a frame which corresponds to rotating `frame` by `theta` in the coordinate system of `relativeFrame`. **Note.** `relativeFrame` should have an orthogonal basis with both vectors having the same length in order for this to make sense. The `relativeFrame` will be `frame` if not provided.
- **scaledFrame(frame, scales, [, relativeFrame])**: This will return a frame which corresponds to scaling `frame` by `[scales[0], scales[1]]` in the coordinate system of `relativeFrame`. The `relativeFrame` will be `frame` if not provided.

### Locations/Vectors in Different Frames

A *location* is considered to be a point in the plane.
A *vector* is considered to be a displacement in the plane.
The key distinction is that the coordinates of a vector in any frame should be independent of the frame's position in the plane.

- **locFrameTrans(loc, frame1, frame2)**: This will return a pair `[a, b]` corresponding to the `frame2`-coordinates of the location with `frame1`-coordinates `[loc[0], loc[1]]`.
- **locsFrameTrans(locs, frame1, frame2)**: This will simply run `locs.map(loc => locFrameTrans(loc, frame1, frame2))`. I am not savy enough with javascript to bootstrap this into a single function.
- **vecFrameTrans(vec, frame1, frame2)**: This will return a pair `[a, b]` corresponding to the `frame2`-coordinates of the vector with `frame1`-coordinates `[vec[0], vec[1]]`. This is different from **locFramTrans**, as we consider vectors independent of the origin of the frame.
- **vecsFrameTrans(vecs, frame1, frame2)**: This will simply run `vecs.map(vec => vecFrameTrans(vec, frame1, frame2))`. I am not savy enough with javascript to bootstrap this into a single function.

## Examples

The `./example.html` in the project repository will showcase how the three rigid-body transformations above behave.
Consider [viewport.js]() for an example of how one can use this module for more interactive apps.
