const xs = require('xstream').default;
const frames = require('../index.js');
const { run } = require('@cycle/run');
const GIFEncoder = require('gifencoder');
const fs = require('fs');
const { createCanvas } = require('canvas');

console.log('generating animations...');

/**
 * these are objects that are repeatedly reused
 */
const startFrame = {
  type: 'frame',
  worldMatrix: [[15, 0, 50], [0, -15, 180], [0, 0, 1]],
};
const relFrame = {
  type: 'frame',
  worldMatrix: [[20, 20, 200], [20, -20, 150], [0, 0, 1]],
};
const timeStream = () => xs.periodic(1000 / 24.).map(x => x/24.).take(24);

/**
 * translation examples
 */

// in one's own coordinates
const t1Frame$ = timeStream().map(t => frames.translatedFrame(
  startFrame, 
  [3*t, 7*t]
));
render('translated-self.gif', t1Frame$);

// in relative coordinates
const t2Frame$ = timeStream().map(t => frames.translatedFrame(
  startFrame, 
  [3*t, 7*t],
  relFrame
));
render('translated-relative.gif', t2Frame$);

/**
 * rotation examples
 */

// in one's own coordinates
const r1Frame$ = timeStream().map(t => frames.rotatedFrame(
  startFrame, 
  t * 2 * Math.PI
));
render('rotated-self.gif', r1Frame$);

// in relative coordinates
const r2Frame$ = timeStream().map(t => frames.rotatedFrame(
  startFrame, 
  t * 2 * Math.PI,
  relFrame
));
render('rotated-relative.gif', r2Frame$);

/**
 * scale examples
 */

// in one's own coordinates
const s1Frame$ = timeStream().map(t => frames.scaledFrame(
  startFrame, 
  [0.9 * (1-t), 0.9 * (1-t)]
));
render('scaled-self.gif', s1Frame$);

// in relative coordinates
const s2Frame$ = timeStream().map(t => frames.scaledFrame(
  startFrame, 
  [0.9 * (1-t), 0.9 * (1-t)],
  relFrame
));
render('scaled-relative.gif', s2Frame$);

/**
 * helper functions
 */
function render(name, stream$) {
  const encoder = new GIFEncoder(400, 300);

  encoder.createReadStream().pipe(fs.createWriteStream(name));
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(1000/24.);
  encoder.setQuality(10);

  const context = createCanvas(800, 600).getContext('2d');

  stream$.addListener({
    next: frame => {
      drawFrames(context, frame, relFrame);
      encoder.addFrame(context);
    },
    complete: () => {
      console.log(`completed '${name}'`);
      encoder.finish();
    },
  });
}

function drawFrames(context, frame, relFrame) {
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'white';
  context.fillRect(0, 0, 800, 600);
  context.lineWidth = 3;
  context.strokeStyle = 'red';
  drawFrame(context, frame);
  context.strokeStyle = 'green';
  drawFrame(context, relFrame);
}

function drawFrame(context, frame) {
  const coords = frames.locsFrameTrans(
    [[0, 1], [0, 0], [1, 0]], 
    frame, 
    { worldMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] }
  );
  context.beginPath();
  context.moveTo(...coords[0]);
  context.lineTo(...coords[1]);
  context.lineTo(...coords[2]);
  context.stroke();
}
