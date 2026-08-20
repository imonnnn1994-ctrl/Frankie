import * as THREE from "three";

export class Interactable {
  constructor(mesh, { radius = 1.4, prompt = "按 E 交互", onInteract, isAvailable } = {}) {
    this.mesh = mesh;
    this.radius = radius;
    this.prompt = prompt;
    this.onInteract = onInteract || (() => {});
    this.isAvailable = isAvailable || (() => true);
  }

  distanceTo(position) {
    const dx = this.mesh.position.x - position.x;
    const dz = this.mesh.position.z - position.z;
    return Math.hypot(dx, dz);
  }
}

export function makeNoteMesh(scene, position, color = 0xffe066) {
  const geo = new THREE.OctahedronGeometry(0.28, 0);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);
  mesh.position.y = 1.1;
  scene.add(mesh);
  return mesh;
}
