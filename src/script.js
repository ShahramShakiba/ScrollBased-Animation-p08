import * as THREE from 'three';
import GUI from 'lil-gui';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const gui = new GUI();

//====================== Objects ======================
const parameters = {
  materialColor: '#ffeded',
};

gui.addColor(parameters, 'materialColor');

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
});

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//==================== Resize Listener ================
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//==================== Animate ========================
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
