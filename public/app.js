// Matter.js module aliases
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;

// Create engine
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
  element: document.getElementById('canvas-container'),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: '#1a1a2e'
  }
});

// Create boundaries (walls)
const wallThickness = 50;
const walls = [
  // Ground
  Bodies.rectangle(window.innerWidth / 2, window.innerHeight + wallThickness / 2, window.innerWidth, wallThickness, {
    isStatic: true,
    render: { fillStyle: '#16213e' }
  }),
  // Ceiling
  Bodies.rectangle(window.innerWidth / 2, -wallThickness / 2, window.innerWidth, wallThickness, {
    isStatic: true,
    render: { fillStyle: '#16213e' }
  }),
  // Left wall
  Bodies.rectangle(-wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight, {
    isStatic: true,
    render: { fillStyle: '#16213e' }
  }),
  // Right wall
  Bodies.rectangle(window.innerWidth + wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight, {
    isStatic: true,
    render: { fillStyle: '#16213e' }
  })
];

World.add(world, walls);

// Function to create a ball
function createBall(x, y) {
  const radius = 10 + Math.random() * 5; // Random radius between 10-15px
  const colors = ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#f4a261', '#2a9d8f', '#e76f51', '#ffb703', '#fb8500'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const ball = Bodies.circle(x, y, radius, {
    restitution: 0.8, // Bounciness
    friction: 0.001,
    density: 0.001,
    render: {
      fillStyle: randomColor
    }
  });

  World.add(world, ball);
  return ball;
}

// Create 100 initial balls
for (let i = 0; i < 100; i++) {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * (window.innerHeight / 2); // Spawn in upper half
  createBall(x, y);
}

// Run the engine
Engine.run(engine);
Render.run(render);

// Handle continuous ball creation while mouse/touch is held down
const canvas = render.canvas;
let isMouseDown = false;
let isTouchActive = false;
let ballCreationInterval = null;

// Helper function to get scaled coordinates
function getScaledCoordinates(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

// Mouse events
canvas.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  const coords = getScaledCoordinates(event.clientX, event.clientY);
  createBall(coords.x, coords.y);

  // Create balls continuously while mouse is held down
  ballCreationInterval = setInterval(() => {
    if (isMouseDown) {
      createBall(coords.x, coords.y);
    }
  }, 100); // Create a ball every 100ms
});

canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown && ballCreationInterval) {
    clearInterval(ballCreationInterval);
    const coords = getScaledCoordinates(event.clientX, event.clientY);

    ballCreationInterval = setInterval(() => {
      if (isMouseDown) {
        const currentCoords = getScaledCoordinates(event.clientX, event.clientY);
        createBall(currentCoords.x, currentCoords.y);
      }
    }, 100);
  }
});

canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
  if (ballCreationInterval) {
    clearInterval(ballCreationInterval);
    ballCreationInterval = null;
  }
});

canvas.addEventListener('mouseleave', () => {
  isMouseDown = false;
  if (ballCreationInterval) {
    clearInterval(ballCreationInterval);
    ballCreationInterval = null;
  }
});

// Touch events for mobile
let lastTouchX = 0;
let lastTouchY = 0;

canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  isTouchActive = true;
  const touch = event.touches[0];
  const coords = getScaledCoordinates(touch.clientX, touch.clientY);
  lastTouchX = touch.clientX;
  lastTouchY = touch.clientY;
  createBall(coords.x, coords.y);

  // Create balls continuously while touch is held
  ballCreationInterval = setInterval(() => {
    if (isTouchActive) {
      const currentCoords = getScaledCoordinates(lastTouchX, lastTouchY);
      createBall(currentCoords.x, currentCoords.y);
    }
  }, 100);
});

canvas.addEventListener('touchmove', (event) => {
  event.preventDefault();
  if (isTouchActive) {
    const touch = event.touches[0];
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
  }
});

canvas.addEventListener('touchend', (event) => {
  event.preventDefault();
  isTouchActive = false;
  if (ballCreationInterval) {
    clearInterval(ballCreationInterval);
    ballCreationInterval = null;
  }
});

canvas.addEventListener('touchcancel', (event) => {
  event.preventDefault();
  isTouchActive = false;
  if (ballCreationInterval) {
    clearInterval(ballCreationInterval);
    ballCreationInterval = null;
  }
});

// Accelerometer support
let accelerometerEnabled = false;
let sensitivityMultiplier = 50.0; // Default sensitivity (5000%)

// Slider control for sensitivity
const sensitivitySlider = document.getElementById('sensitivity-slider');
const sensitivityValue = document.getElementById('sensitivity-value');

sensitivitySlider.addEventListener('input', (event) => {
  const sliderValue = parseFloat(event.target.value);
  const actualPercentage = sliderValue * 100; // Slider 0-100 represents 0-10000%
  sensitivityMultiplier = sliderValue; // Multiplier is the slider value directly
  sensitivityValue.textContent = actualPercentage.toFixed(0) + '%';
});

function handleOrientation(event) {
  if (!accelerometerEnabled) return;

  // beta: front-to-back tilt (-180 to 180)
  // gamma: left-to-right tilt (-90 to 90)
  const beta = event.beta || 0;
  const gamma = event.gamma || 0;

  // Scale factor to convert tilt to gravity strength, adjusted by sensitivity
  const gravityScale = 0.001 * sensitivityMultiplier;

  // Update gravity based on device orientation
  engine.world.gravity.x = gamma * gravityScale;
  engine.world.gravity.y = beta * gravityScale;
}

// Check if we need to request permission (iOS 13+)
if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
  // Show permission button for iOS
  const permissionContainer = document.getElementById('permission-container');
  const permissionBtn = document.getElementById('permission-btn');

  permissionContainer.style.display = 'block';

  permissionBtn.addEventListener('click', () => {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          accelerometerEnabled = true;
          window.addEventListener('deviceorientation', handleOrientation);
          permissionContainer.style.display = 'none';
        }
      })
      .catch(console.error);
  });
} else if (window.DeviceOrientationEvent) {
  // For other devices, just listen to the event
  accelerometerEnabled = true;
  window.addEventListener('deviceorientation', handleOrientation);
} else {
  // Fallback to standard gravity for desktop
  engine.world.gravity.y = 1;
}

// Handle window resize
window.addEventListener('resize', () => {
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;

  // Update wall positions
  Body.setPosition(walls[0], { x: window.innerWidth / 2, y: window.innerHeight + wallThickness / 2 });
  Body.setPosition(walls[1], { x: window.innerWidth / 2, y: -wallThickness / 2 });
  Body.setPosition(walls[2], { x: -wallThickness / 2, y: window.innerHeight / 2 });
  Body.setPosition(walls[3], { x: window.innerWidth + wallThickness / 2, y: window.innerHeight / 2 });

  // Update wall sizes
  Body.setVertices(walls[0], Bodies.rectangle(window.innerWidth / 2, window.innerHeight + wallThickness / 2, window.innerWidth, wallThickness).vertices);
  Body.setVertices(walls[1], Bodies.rectangle(window.innerWidth / 2, -wallThickness / 2, window.innerWidth, wallThickness).vertices);
  Body.setVertices(walls[2], Bodies.rectangle(-wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight).vertices);
  Body.setVertices(walls[3], Bodies.rectangle(window.innerWidth + wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight).vertices);
});
