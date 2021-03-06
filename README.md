# frames.js

A set of tools for working with coordinate systems in the plane.

## Download

```
npm install @mvarble/frames.js
```

## The Mathematics

One can simply encode affine coordinate systems in the plane by 3x3 *frame* matrices.
This way, calculations like rigid body transformations and coordinate transforms can be streamlined into simple matrix multiplication calculations.
The purpose of this module is to wrap all such calculations into a simple API.

## The Code

Because we would sometimes like a frame relative to another, it is very natural to store our frames in a tree structure.
To this end, a frame is nothing but a JSON object which has `worldMatrix` and `children` fields.
Because frames are created primarily for rendering to the HTML canvas, one should be able to easily search through all the frames within a given context and access any sort of metadata each frame has.
It is then decided that the objects will behave like [unist](https://github.com/syntax-tree/unist) trees.
Consider the example below.

```js
const boxFrame = {
  type: 'box',
  worldMatrix: [[10, 0, 420], [0, -10, 69], [0, 0, 1]],
};

const planeFrame = {
  type: 'frame',
  worldMatrix: [[10, 0, 400], [0, -10, 400], [0, 0, 1]],
  children: [boxFrame],
};
```

Since our frames are encoded with simple JSON objects, the magic of the module is in the functions which parse/generate frames.
For transforming frames, we have an API for updating the frame's world matrix explicitly, providing affine transformations, or simply saying which basic (translate/rotate/scale) operation we want.
Each such transformation has two froms; one which is a **pure** function which simply returns a new frame and an **impure** one that simply manipulates the `frame.worldMatrix` attribute.
Below, transformation will be identified with its (pure/impure) function names.

We can also perform coordinate calculations which allow one to get the coordinates of a location/vector in a particular frame's coordinate system, subject to having those from another frame's coordinate system.
These functions are always pure, as there aren't many examples in which one would want otherwise.

## API

Since this is a small package, one can look at the source code [here](https://github.com/mvarble/frames.js/blob/master/src.js).
Otherwise, for the most part, there are only several functions which are very useful.

### Transformations

If one would like to return a translated/rotated/scaled version of a frame, it is as simple as using the following functions.

#### translatedFrame/translateFrame

```js
newFrame = translatedFrame(frame, disp [, relativeFrame])
```

This will return a frame which corresponds to translating `frame` by `[disp[0], disp[1]]` in the coordinate system of `relativeFrame`. 
The `relativeFrame` will be `frame` if not provided.
The following shows the red frame being translated at a constant velocity of [3, 4] units/second with respect to different coordinate systems.
The first is `translatedFrame(redFrame, [t*3, t*4])` while the second is `translatedFrame(redFrame, [t*3, t*4], greenFrame)` with respect to time `t`.

![translated self](https://raw.githubusercontent.com/mvarble/frames.js/master/examples/translated-self.gif)
![translated relative](https://raw.githubusercontent.com/mvarble/frames.js/master/examples/translated-relative.gif)

#### rotatedFrame/rotateFrame

```js
newFrame = rotatedFrame(frame, theta, [, relativeFrame])
```

This will return a frame which corresponds to rotating `frame` by `theta` in the coordinate system of `relativeFrame`. 
**Note.** `relativeFrame` should have an orthogonal basis with both vectors having the same length in order for this to make sense. The `relativeFrame` will be `frame` if not provided.
The following shows the red frame being rotated at a angular velocity of 2pi radians/second with respect to different coordinate systems.
The first is `rotatedFrame(redFrame, 2 * Math.PI * t)` while the second is `rotatedFrame(redFrame, 2 * Math.PI * t, greenFrame)` with respect to time `t`.

![rotated self](https://raw.githubusercontent.com/mvarble/frames.js/master/examples/rotated-self.gif)
![rotated relative](https://raw.githubusercontent.com/mvarble/frames.js/master/examples/rotated-relative.gif)


#### scaledFrame/scaleFrame

```js
newFrame = scaledFrame(frame, scales, [, relativeFrame])
```

This will return a frame which corresponds to scaling `frame` by `[scales[0], scales[1]]` in the coordinate system of `relativeFrame`. The `relativeFrame` will be `frame` if not provided.
The following shows the red frame being scaled with respect to different coordinate systems.
The first is `scaledFrame(redFrame, [0.9 * (1 - t), 0.9 * (1 - t)])` while the second is `scaledFrame(redFrame, [0.9 * (1 - t), 0.9 * (1 - t)], greenFrame)` with respect to time `t`.

![scaled self](https://raw.githubusercontent.com/mvarble/frames.js/master/examples/scaled-self.gif)
![scaled relative](https://raw.githubusercontent.com/mvarble/frames.js/master/examples/scaled-relative.gif)


### Locations/Vectors in Different Frames

A *location* is considered to be a point in the plane.
A *vector* is considered to be a displacement in the plane.
The key distinction is that the coordinates of a vector in any frame should be independent of the frame's position in the plane.

#### locFrameTrans

```js
sameLoc = locFrameTrans(loc, frame1, frame2)
```

This will return a pair `[a, b]` corresponding to the `frame2`-coordinates of the location with `frame1`-coordinates `[loc[0], loc[1]]`.

#### locsFrameTrans

```js
sameLocs = locsFrameTrans(locs, frame1, frame2)
```

This will simply run `locs.map(loc => locFrameTrans(loc, frame1, frame2))`. 
I am not savy enough with javascript to bootstrap this into a single function.

#### vecFrameTrans

```js
sameVec = vecFrameTrans(vec, frame1, frame2)
```

This will return a pair `[a, b]` corresponding to the `frame2`-coordinates of the vector with `frame1`-coordinates `[vec[0], vec[1]]`. 
This is different from **locFrameTrans**, as we consider vectors independent of the origin of the frame.

#### vecsFrameTrans

```js
sameVecs = vecsFrameTrans(vecs, frame1, frame2)
```

This will simply run `vecs.map(vec => vecFrameTrans(vec, frame1, frame2))`. 
I am not savy enough with javascript to bootstrap this into a single function.

## Examples

- [viewport.js](https://github.com/mvarble/viewport.js): an example of how one can use this module for more interactive apps.
