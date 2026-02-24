# Matter.js Physics Demo

An interactive physics playground built with Matter.js. The application displays 100 bouncing balls that respond to device orientation on mobile devices. Users can continuously spawn new balls by holding down the mouse or touch, and adjust motion sensitivity with a slider control.

## Features

- **100 Initial Balls**: Colorful balls with realistic physics
- **Continuous Ball Spawning**: Hold mouse button or touch screen to create streams of balls
- **Motion Sensitivity Control**: Adjust device tilt responsiveness from 0% to 10,000%
- **Responsive Design**: Works on both desktop and mobile browsers
- **Accelerometer Support**: Balls respond to device tilt on mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Start the server
npm start
```

The application will be available at http://localhost:3000

## Usage

- **Desktop**: Click and hold to spawn balls continuously. Move the mouse while holding to create trails.
- **Mobile**: Tap and hold to spawn balls. Tilt your device to control gravity direction. You may need to grant accelerometer permissions on iOS devices.
- **Sensitivity Slider**: Adjust the slider at the top to control how strongly balls respond to device motion (0-10,000%).

## Technology Stack

- **Backend**: Express.js
- **Physics Engine**: Matter.js
- **Sensors**: DeviceOrientationEvent API
- **Frontend**: Vanilla JavaScript

## License

MIT
