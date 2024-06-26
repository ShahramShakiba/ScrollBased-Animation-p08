import * as THREE from 'three';
import gsap from 'gsap';
import GUI from 'lil-gui';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const parameters = {
  materialColor: '#ffeded',
  particleSize: 1.5,
};

//====================== Texture ======================
const textureLoader = new THREE.TextureLoader();

const triangleTexture = textureLoader.load('./textures/triangle.png');
triangleTexture.colorSpace = THREE.SRGBColorSpace;

//====================== Objects ======================
const objectDistance = 4;

const material = new THREE.MeshStandardMaterial({
  color: parameters.materialColor,
  roughness: 0.5,
  metalness: 0.1,
});

const homeMesh = new THREE.Mesh(
  new THREE.TorusGeometry(0.75, 0.35, 30),
  material
);

const aboutMeMesh = new THREE.Mesh(
  new THREE.DodecahedronGeometry(1, 0),
  material
);

const contactMesh = new THREE.Mesh(
  new THREE.ConeGeometry(0.85, 1.5, 7),
  material
);

homeMesh.position.y = -objectDistance * 0; // You can remove this line
aboutMeMesh.position.y = -objectDistance * 1;
contactMesh.position.y = -objectDistance * 2;

homeMesh.position.x = 2;
aboutMeMesh.position.x = -2;
contactMesh.position.x = 2;

scene.add(homeMesh, aboutMeMesh, contactMesh);

//=== put all meshes in an array to rotate them in tick()
const sectionMeshes = [homeMesh, aboutMeMesh, contactMesh];

//===================== Particles =====================
const count = 70;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
  const i3 = i * 3;

  positions[i3] = (Math.random() - 0.5) * 10;
  positions[i3 + 1] =
    objectDistance * 0.5 -
    Math.random() * objectDistance * sectionMeshes.length;
  positions[i3 + 2] = (Math.random() - 0.5) * 10;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  size: parameters.particleSize,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  // color: parameters.materialColor,
  map: triangleTexture,
  // transparent: true,
});

const particleMesh = new THREE.Points(particleGeometry, particlesMaterial);
scene.add(particleMesh);

//====================== Lights =======================
const directionalLight = new THREE.DirectionalLight(0x4e00ff, 4);
directionalLight.position.set(-2, 10, -1);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x00fffc, 0.15);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff9000, 4.5,20);
pointLight.position.set(1, -4.5, 2);
scene.add(pointLight);

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

  adjustObjectsAndParticles(width);
});

//==================== Adjust Objects Based on Width ====================
const adjustObjectsAndParticles = (width) => {
  if (width <= 480) {
    homeMesh.scale.set(0.5, 0.5, 0.5);
    aboutMeMesh.scale.set(0.5, 0.5, 0.5);
    contactMesh.scale.set(0.5, 0.5, 0.5);
    particlesMaterial.size = 1.0;

    homeMesh.position.y = objectDistance * 0.2;
    aboutMeMesh.position.y = -objectDistance * 0.85;
    contactMesh.position.y = -objectDistance * 2.3;

    homeMesh.position.x = 0.4;
    aboutMeMesh.position.x = 0.3;
    contactMesh.position.x = 0.52;
  } else if (width <= 768) {
    homeMesh.scale.set(0.75, 0.75, 0.75);
    aboutMeMesh.scale.set(0.75, 0.75, 0.75);
    contactMesh.scale.set(0.75, 0.75, 0.75);
    particlesMaterial.size = 1.2;

    homeMesh.position.y = objectDistance * 0.2;
    aboutMeMesh.position.y = -objectDistance * 0.85;
    contactMesh.position.y = -objectDistance * 2.2;

    homeMesh.position.x = 1;
    aboutMeMesh.position.x = 0;
    contactMesh.position.x = 0.7;
  } else {
    // Adjust for large screens
    homeMesh.scale.set(1, 1, 1);
    aboutMeMesh.scale.set(1, 1, 1);
    contactMesh.scale.set(1, 1, 1);
    particlesMaterial.size = 1.5;

    homeMesh.position.x = 2;
    aboutMeMesh.position.x = -2;
    contactMesh.position.x = 2;
  }
};

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
      duration: 1.8,
      ease: 'power2.inOut',
      x: '+=8',
      y: '+=9',
      z: '+=1.4',
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

//==================== Music =========================
const audio = new Audio('./music/all-for-you.mp3');
audio.loop = true;
audio.volume = 0.4;

const playButton = document.querySelector('.play-button');
const playButtonImage = playButton.querySelector('img');
let isPlaying = false;

const animatePlayButtonImage = () => {
  if (isPlaying) {
    gsap.to(playButtonImage, {
      scale: 1.4,
      duration: 0.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });

    gsap.to(playButtonImage, {
      rotation: 360,
      duration: 5,
      ease: 'linear',
      repeat: -1,
    });
  } else {
    // Stop and remove all ongoing GSAP animations
    gsap.killTweensOf(playButtonImage);

    gsap.to(playButtonImage, {
      scale: 1,
      duration: 0.5,
      ease: 'power1.inOut',
      rotation: 0,
    });
  }
};

playButton.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();

    // Change the icon to play
    playButtonImage.src = './textures/social/music.png';
  } else {
    audio.play();

    // Change the icon to pause
    playButtonImage.src = './textures/social/pause.png';
  }
  isPlaying = !isPlaying;

  gsap.to(playButton, {
    scale: 1.2,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: 'power1.inOut',
  });

  gsap.to(playButton, {
    rotation: isPlaying ? 360 : -360,
    duration: 0.5,
    ease: 'power1.inOut',
  });

  // Trigger the image animation
  animatePlayButtonImage();
});

//==================== Animate ========================
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime; // update "pre" for the next frame

  //======== Animate Camera
  camera.position.y = (-scrollY / height) * objectDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 3 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  //======== Animate Meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.12;
    mesh.rotation.y += deltaTime * 0.14;
  }

  //======== Animate Particles
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    particleGeometry.attributes.position.array[i3 + 1] +=
      Math.sin(elapsedTime + i3) * 0.001; // Y

    particleGeometry.attributes.position.array[i3] +=
      Math.cos(elapsedTime + i3) * 0.001; // X
  }
  particleGeometry.attributes.position.needsUpdate = true;

  //======== Animating particle color
  const hue = Math.sin(elapsedTime * 0.3) % 1; // Cycles hue between 0 and 1
  particlesMaterial.color.setHSL(hue, 0.5, 0.5);

  adjustObjectsAndParticles(width);

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
