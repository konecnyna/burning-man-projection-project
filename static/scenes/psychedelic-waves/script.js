// Initialize mousePos at the top level of the script
let mousePos = { x: 0, y: 0, px: 0, py: 0 };

// Initialize parameters before using them
let parameters = {
  speed: 0.2,
  hue: 0.5,
  hueVariation: 1,
  gradient: .5,
  density: .75,
  displacement: .8
};

class World {
  constructor(width, height) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.container = document.getElementsByClassName("world")[0];

    // Check if the container is found
    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
    } else {
      console.error("World container element not found.");
      return;
    }

    this.scene = new THREE.Scene();
    this.width = width;
    this.height = height;
    this.aspectRatio = width / height;
    this.fieldOfView = 50;
    var nearPlane = 0.1;
    var farPlane = 20000;
    this.camera = new THREE.PerspectiveCamera(this.fieldOfView, this.aspectRatio, nearPlane, farPlane);
    this.camera.position.z = 200;
    this.timer = 0;
    this.mousePos = { x: 0, y: 0 };
    this.targetMousePos = { x: 0, y: 0 };
    this.createPlane();
    this.render();
  }

  createPlane() {
    this.material = new THREE.RawShaderMaterial({
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
      uniforms: {
        uTime: { type: 'f', value: 0 },
        uHue: { type: 'f', value: parameters.hue },
        uHueVariation: { type: 'f', value: parameters.hueVariation },
        uGradient: { type: 'f', value: parameters.gradient },
        uDensity: { type: 'f', value: parameters.density },
        uDisplacement: { type: 'f', value: parameters.displacement },
        uMousePosition: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) }
      }
    });
    this.planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    this.plane = new THREE.Mesh(this.planeGeometry, this.material);
    this.scene.add(this.plane);
  }

  render() {
    this.timer += parameters.speed;
    this.plane.material.uniforms.uTime.value = this.timer;

    this.mousePos.x += (this.targetMousePos.x - this.mousePos.x) * 0.1;
    this.mousePos.y += (this.targetMousePos.y - this.mousePos.y) * 0.1;

    if (this.plane) {
      this.plane.material.uniforms.uMousePosition.value = new THREE.Vector2(this.mousePos.x, this.mousePos.y);
    }

    this.renderer.render(this.scene, this.camera);
  }

  loop() {
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }

  updateSize(w, h) {
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  mouseMove(mousePos) {
    this.targetMousePos.x = mousePos.px;
    this.targetMousePos.y = mousePos.py;
  }
}

document.addEventListener("DOMContentLoaded", domIsReady);

// Setup WebSocket connection
const socket = io();

function domIsReady() {
  let world = new World(window.innerWidth, window.innerHeight);
  world.loop();

  // // GUI for parameters
  // let gui = new dat.GUI();
  // gui.add(parameters, 'speed', 0, 1);
  // gui.add(parameters, 'hue', 0, 1);
  // gui.add(parameters, 'hueVariation', 0, 1);
  // gui.add(parameters, 'gradient', 0, 1);
  // gui.add(parameters, 'density', 0, 1);
  // gui.add(parameters, 'displacement', 0, 1);

  window.addEventListener('resize', () => {
    world.updateSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    mousePos.px = mousePos.x / window.innerWidth;
    mousePos.py = 1.0 - mousePos.y / window.innerHeight;
    world.mouseMove(mousePos);
  });

  // Setup WebSocket event handlers
  socket.on('connect', () => {
    console.log('Psychedelic waves scene connected to server');
    // Subscribe to hand tracking events
    socket.emit('subscribe', {
      events: ['hand_moved', 'hand_detected', 'frame_processed']
    });
  });

  // Handle hand tracking events
  socket.on('event', (event) => {
    if ((event.type === 'hand_moved' || event.type === 'hand_detected' || event.type === 'frame_processed') && event.data.hands && event.data.hands.length > 0) {
      try {
        const hand = event.data.hands[0]; // Use first detected hand
        let posX = hand.palm_center.x * window.innerWidth;
        let posY = hand.palm_center.y * window.innerHeight;

        mousePos.x = posX;
        mousePos.y = posY;
        mousePos.px = mousePos.x / window.innerWidth;
        mousePos.py = 1.0 - mousePos.y / window.innerHeight;

        world.mouseMove(mousePos);
      } catch (e) {
        console.trace(e);
      }
    }
  });
}