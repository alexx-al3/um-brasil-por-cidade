// ===== ELEMENTOS HTML (DECLARADO UMA VEZ SÓ) =====
const titulo = document.getElementById("titulo");
const desc = document.getElementById("desc");

// ===== CENA =====
const scene = new THREE.Scene();

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 0, 10);

// ===== RENDER =====
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("bg"),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// ===== LUZ =====
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

// ===== TEXTURA =====
const loader = new THREE.TextureLoader();
const earthMap = loader.load("./earth.jpg");

// ===== PLANETA =====
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(3, 128, 128),
  new THREE.MeshStandardMaterial({ map: earthMap })
);

// posição Brasil
earth.rotation.y = Math.PI;
earth.rotation.x = 0.3;

scene.add(earth);

// ===== FUNÇÃO LAT/LNG =====
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ===== DADOS =====
const cidades = [
  {
    nome: "Oiapoque - AP",
    descricao: "Extremo norte do Brasil",
    lat: 3.84,
    lng: -51.83
  },
  {
    nome: "Chuí - RS",
    descricao: "Extremo sul do Brasil",
    lat: -33.69,
    lng: -53.46
  }
];

// ===== PINS =====
const marcadores = [];

function criarPin(pos) {
  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.07),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );

  pin.position.copy(pos);
  scene.add(pin);
  marcadores.push(pin);
}

// cria pontos
const pontos = cidades.map(c => latLngToVector3(c.lat, c.lng, 3.05));
pontos.forEach(p => criarPin(p));

// ===== TRAJETO =====
const curve = new THREE.CatmullRomCurve3(pontos);

const points = curve.getPoints(100);
const geo = new THREE.BufferGeometry().setFromPoints(points);

const mat = new THREE.LineDashedMaterial({
  color: 0x00ffff,
  dashSize: 0.2,
  gapSize: 0.1
});

const linha = new THREE.Line(geo, mat);
linha.computeLineDistances();
scene.add(linha);

// ===== CARRO =====
const car = new THREE.Mesh(
  new THREE.BoxGeometry(0.25, 0.12, 0.12),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
scene.add(car);

// ===== SCROLL =====
let scroll = 0;

window.addEventListener("scroll", () => {
  scroll = window.scrollY;
});

// ===== ANIMAÇÃO =====
function animate() {
  requestAnimationFrame(animate);

  earth.rotation.y += 0.0005;

  const progress = Math.min(scroll / 2000, 1);
  const pos = curve.getPoint(progress);

  car.position.copy(pos);

  // destaque pin
  marcadores.forEach(m => m.scale.set(1,1,1));
  const index = Math.round(progress * (cidades.length - 1));

  if (marcadores[index]) {
    marcadores[index].scale.set(2,2,2);
  }

  // texto
  const cidade = cidades[index];
  if (cidade) {
    titulo.innerText = cidade.nome;
    desc.innerText = cidade.descricao;
  }

  renderer.render(scene, camera);
}

animate();

// ===== RESPONSIVO =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});