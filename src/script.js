import * as THREE from 'three';
import GUI from 'lil-gui';
import { color } from 'three/examples/jsm/nodes/Nodes.js';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const gui = new GUI();

const parameters = {
  materialColor: '#ffeded',
};

gui.addColor(parameters, 'materialColor');

//====================== Objects ======================
const homeMesh = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4, 16, 60),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
);

const projectMesh = new THREE.Mesh(
  new THREE.ConeGeometry(1, 2, 32),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
);

const contactMesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
);

scene.add(homeMesh, projectMesh, contactMesh);

//====================== Camera =======================
let width = window.innerWidth;
let height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
camera.position.z = 6;
scene.add(camera);

//===================== Renderer ======================
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true, // To have backgroundColor instead of WebGL-color
});

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//==================== Resize Listener ================
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//==================== Animate ========================
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
