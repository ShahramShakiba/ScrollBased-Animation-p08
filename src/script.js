import * as THREE from 'three';
import gsap from 'gsap';
import GUI from 'lil-gui';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const gui = new GUI();

const parameters = {
  materialColor: '#ffeded',
  particleSize: 0.05,
};

gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

//====================== Texture ======================
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('./textures/gradients/3.jpg');
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.colorSpace = THREE.SRGBColorSpace;

//====================== Objects ======================
const objectDistance = 4;

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const homeMesh = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4, 16, 60),
  material
);

const projectMesh = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

const contactMesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

homeMesh.position.y = -objectDistance * 0; // You can remove this line
projectMesh.position.y = -objectDistance * 1;
contactMesh.position.y = -objectDistance * 2;

homeMesh.position.x = 2;
projectMesh.position.x = -2;
contactMesh.position.x = 2;

scene.add(homeMesh, projectMesh, contactMesh);

//=== put all meshes in an array to rotate them in tick()
const sectionMeshes = [homeMesh, projectMesh, contactMesh];

//===================== Particles =====================
const count = 300;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
  const i3 = i * 3;

  positions[i3] = (Math.random() - 0.5) * 10;
  positions[i3 + 1] =
    objectDistance * 0.5 -
    Math.random() * objectDistance * sectionMeshes.length;
  positions[i3 + 2] = (Math.random() - 0.5) * 10;
}

const ParticleGeometry = new THREE.BufferGeometry();
ParticleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  size: parameters.particleSize,
  sizeAttenuation: true,
  // depthWrite: false,
  blending: THREE.AdditiveBlending,
  color: parameters.materialColor,
});

const particleMesh = new THREE.Points(ParticleGeometry, particlesMaterial);
scene.add(particleMesh);

//====================== Lights =======================
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

//====================== Camera =======================
let width = window.innerWidth;
let height = window.innerHeight;

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

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

//==================== Scroll =========================
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;

  // Each section is one viewport height. Additional adjustments are required for longer sections.
  const newSection = Math.round(scrollY / height);

  if (newSection != currentSection) {
    currentSection = newSection;
    // console.log('Changed!', currentSection);

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
      z: '+=1.5',
    });
  }
});

//==================== Cursor =========================
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / width - 0.5;
  cursor.y = event.clientY / height - 0.5;
  // normalize the value (from -0.5 to +0.5)

  // console.log(cursor);
});

//==================== Animate ========================
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime; // update "pre" for the next frame

  //=== Animate Camera
  camera.position.y = (-scrollY / height) * objectDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  //=== Animate Meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.12;
    mesh.rotation.y += deltaTime * 0.14;
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

/* 
* Parallax
- is the action of seeing one object through different observation points

- This is done naturally by our eyes and it's how we feel the depth of things
*/

/*                                - creating an "easing" effect -
* cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.02;
  
? if tou test the experience on a high frequency screen, the "tick" function will be called more often and the camera will move faster toward the target

- we need to know how much time was spent since the last frame

* cameraGroup.position.x +=
*    (parallaxX - cameraGroup.position.x) * 0.9 * deltaTime;

- with this "deltaTime", in different screen frequency we will have the same speed
*/
