import * as THREE from 'three';
import gsap from 'gsap';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

let width = window.innerWidth;
let height = window.innerHeight;
const objectDistance = 4;
const trianglesCount = 55;
const starsCount = 400;

//======================= Texture =======================
const textureLoader = new THREE.TextureLoader();

const triangleTexture = textureLoader.load('./textures/triangle.png');
triangleTexture.colorSpace = THREE.SRGBColorSpace;
const starTexture = textureLoader.load('./textures/star.png');
starTexture.colorSpace = THREE.SRGBColorSpace;

//======================= Objects =======================
const material = new THREE.MeshStandardMaterial({
  color: '#ffeded',
  roughness: 0.6,
  metalness: 0.2,
});

const homeMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), material);

const aboutMeMesh = new THREE.Mesh(
  new THREE.TorusGeometry(0.75, 0.35, 30),
  material
);

const contactMesh = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.5), material);

scene.add(homeMesh, aboutMeMesh, contactMesh);

// put all meshes in an array to rotate them in tick()
const objectsContainer = [homeMesh, aboutMeMesh, contactMesh];

//===================== Particles =====================
const createParticlePositions = (count) => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    positions[i3] = (Math.random() - 0.5) * 10;

    positions[i3 + 1] =
      objectDistance *
      0.5 *
      (Math.random() - 0.5) *
      objectDistance *
      objectsContainer.length;

    positions[i3 + 2] = (Math.random() - 0.5) * 10;
  }

  return positions;
};

const trianglePositions = createParticlePositions(trianglesCount);
const starPositions = createParticlePositions(starsCount);

//================ Geometry
const triangleGeometry = new THREE.BufferGeometry();
triangleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(trianglePositions, 3)
);

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(starPositions, 3)
);

//================ Material
const createParticleMaterial = (texture) => {
  return new THREE.PointsMaterial({
    sizeAttenuation: true,
    map: texture,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
};

const triangleMaterial = createParticleMaterial(triangleTexture);
const starMaterial = createParticleMaterial(starTexture);

//================ Points
const triangle = new THREE.Points(triangleGeometry, triangleMaterial);
const star = new THREE.Points(starGeometry, starMaterial);

scene.add(triangle, star);

//=========== Adjust Objects Based on Width ===============
const adjustObjectsAndParticles = (width) => {
  if (width <= 480) {
    homeMesh.scale.set(0.4, 0.4, 0.4);
    aboutMeMesh.scale.set(0.45, 0.45, 0.45);
    contactMesh.scale.set(0.55, 0.55, 0.55);

    homeMesh.position.y = objectDistance * 0.35;
    aboutMeMesh.position.y = -objectDistance * 0.75;
    contactMesh.position.y = -objectDistance * 2.4;

    homeMesh.position.x = 0.65;
    aboutMeMesh.position.x = 0.5;
    contactMesh.position.x = -0.5;

    triangleMaterial.size = 0.7;
    starMaterial.size = 0.25;
  } else if (width <= 768) {
    homeMesh.scale.set(0.55, 0.55, 0.55);
    aboutMeMesh.scale.set(0.6, 0.6, 0.6);
    contactMesh.scale.set(0.6, 0.6, 0.6);

    homeMesh.position.y = objectDistance * 0.2;
    aboutMeMesh.position.y = -objectDistance * 0.85;
    contactMesh.position.y = -objectDistance * 2.5;

    homeMesh.position.x = 1;
    aboutMeMesh.position.x = 0.5;
    contactMesh.position.x = -0.5;

    triangleMaterial.size = 0.8;
    starMaterial.size = 0.3;
  } else {
    // Adjust for large screens
    homeMesh.scale.set(0.85, 0.85, 0.85);
    aboutMeMesh.scale.set(0.9, 0.9, 0.9);
    contactMesh.scale.set(0.9, 0.9, 0.9);

    homeMesh.position.y = objectDistance * 0.15;
    aboutMeMesh.position.y = -objectDistance * 0.85;
    contactMesh.position.y = -objectDistance * 2;

    homeMesh.position.x = 1.55;
    aboutMeMesh.position.x = -2.3;
    contactMesh.position.x = 1;

    triangleMaterial.size = 1;
    starMaterial.size = 0.3;
  }
};

adjustObjectsAndParticles(width);

//====================== Lights ========================
const directionalLight = new THREE.DirectionalLight(0x518ffc, 3);
directionalLight.position.set(-7, 8, 5);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x00fffc, 0.15);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff9000, 6.5, 10);
pointLight.position.set(2, -2, 2.5);
scene.add(pointLight);

//===================== Camera =========================
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

//==================== Renderer ========================
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true, // To have backgroundColor instead of WebGL-color ✔️
});

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// renderer.setClearColor('red', 0.5); // Set a clear color & opacity
// renderer.setClearAlpha(0.5); // Set a clear alpha

//================ Resize Listener ====================
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  adjustObjectsAndParticles(width);
});

//=================== Scroll =========================
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;

  // Each section is 1 viewport height. Additional adjustments are required for longer sections
  const newSection = Math.round(scrollY / height);

  if (newSection !== currentSection) {
    currentSection = newSection;
    // console.log('Changed!', currentSection);

    gsap.to(objectsContainer[currentSection].rotation, {
      duration: 2,
      x: '+=3',
      y: '+=4',
      z: '+=1',
    });
  }
});

//================== Cursor ========================
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / width - 0.5;
  cursor.y = event.clientY / height - 0.5;

  // console.log(cursor);
});

//================= Music ==========================
const audio = new Audio('./music/connect-me.mp3');
audio.loop = true;
audio.volume = 0.4;

const playButton = document.querySelector('.play-button');
const playButtonImage = playButton.querySelector('img');
let isPlaying = false;

playButton.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();

    // Change the icon to play
    playButtonImage.src = './textures/social/music.png';
  } else {
    audio.currentTime = 0;
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

//================== GSAP Animations ===================
const createSectionAnimations = (section) => {
  const sectionElement = document.getElementById(section);

  if (!sectionElement) return;

  const h1 = sectionElement.querySelector('h1');
  const h2 = sectionElement.querySelector('h2');
  const h3 = sectionElement.querySelector('h3');
  const p = sectionElement.querySelectorAll('p');
  const img = sectionElement.querySelector('.socials');
  const cta = sectionElement.querySelector('.cta');

  if (h1) {
    gsap.from(h1, {
      duration: 1.5,
      autoAlpha: 0,
      scale: 3,
      y: -50,
      // x: 250,
    });
  }
  if (h2) {
    gsap.from(h2, {
      duration: 1.5,
      autoAlpha: 0,
      y: -50,
      // x: 150,
      scale: 3,
    });
  }
  if (h3) {
    gsap.from(h3, {
      duration: 1.5,
      autoAlpha: 0,
      // x: -90,
      delay: 0.7,
      rotation: 360,
    });
  }
  if (p) {
    gsap.from(p, {
      duration: 1.5,
      autoAlpha: 0,
      // x: 350,
      y: 180,
      delay: 0.3,
      stagger: 0.3,
      scale: 0.01,
    });
  }
  if (img) {
    gsap.from(img, {
      duration: 1.7,
      autoAlpha: 0,
      delay: 0.1,
      // x: -50,
    });
  }
  if (cta) {
    gsap.from(cta, {
      duration: 1.5,
      autoAlpha: 0,
      // x: -190,
      delay: 0.5,
      scale: 0.01,
    });
  }
};

// Intersection Observer: activate GSAP when the user gets the current-section
const sections = document.querySelectorAll('.section');
const options = {
  root: null,
  threshold: 0.15, // Control when the animation starts
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      createSectionAnimations(entry.target.id);

      // Stop observing after the animation starts
      // observer.unobserve(entry.target);
    }
  });
}, options);

sections.forEach((section) => {
  observer.observe(section);
});

//=================== Animate =======================
const clock = new THREE.Clock();
let prevTime = 0;

const tick = () => {
  //=========== 4
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime; // update "pre" for the next frame

  const h3 = document.querySelector('h3');

  //=========== Update the position of the <h3>
  const animateCircularMotion = (element, radius, centerX, speed) => {
    const x = centerX + radius * Math.cos(speed * elapsedTime);

    gsap.to(element, {
      x: x,
      duration: 0.5,
      ease: 'none',
    });
  };
  animateCircularMotion(h3, 20, width / 65, 1);

  //========== Move the camera with scroll - 1
  camera.position.y = (-scrollY / height) * objectDistance;

  //========== Parallax - 3
  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 3 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  //========== Animate Meshes - 2
  for (const obj of objectsContainer) {
    obj.rotation.x += deltaTime * 0.18;
    obj.rotation.y += deltaTime * 0.15;
    obj.rotation.z += deltaTime * 0.11;
  }

  //========== Animate Particles - 6
  for (let i = 0; i < trianglesCount; i++) {
    const i3 = i * 3;

    triangleGeometry.attributes.position.array[i3] +=
      Math.cos(elapsedTime + i3) * 0.001; // X

    triangleGeometry.attributes.position.array[i3 + 1] +=
      Math.sin(elapsedTime + i3) * 0.001; // Y
  }

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;

    starGeometry.attributes.position.array[i3] -=
      Math.cos(elapsedTime + i3) * Math.random() * 0.0015;

    starGeometry.attributes.position.array[i3 + 1] -=
      Math.sin(elapsedTime + i3) * Math.random() * 0.0012;
  }

  triangleGeometry.attributes.position.needsUpdate = true;
  starGeometry.attributes.position.needsUpdate = true;

  //========= Animating particle color - 7
  const hue = Math.sin(elapsedTime * 0.3) % 1; // Cycles hue between 0 and 1
  triangleMaterial.color.setHSL(hue, 0.5, 0.5);

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

/*                                - creating an "easing" effect -
* cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.02;
  
? if tou test the experience on a high frequency screen, the "tick" function will be called more often and the camera will move faster toward the target

- we need to know how much time was spent since the last frame

* cameraGroup.position.x +=
*    (parallaxX - cameraGroup.position.x) * 0.9 * deltaTime;

- with this "deltaTime", in different screen frequency we will have the same speed
*/
