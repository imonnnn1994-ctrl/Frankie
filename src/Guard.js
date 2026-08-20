import * as THREE from "three";

const SPEED = 1.8;
const FOV = THREE.MathUtils.degToRad(70); // total cone angle
const RANGE = 8.5;
const EYE_HEIGHT = 1.4;
const GAIN_RATE = 55; // detection points/sec at close range, unsneaking
const DECAY_RATE = 30;

export class Guard {
  constructor(scene, waypoints, occluders) {
    const geo = new THREE.CapsuleGeometry(0.4, 1.1, 4, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.6 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    this.waypoints = waypoints;
    this.target = 0;
    this.mesh.position.copy(waypoints[0]);
    this.occluders = occluders;
    this.forward = new THREE.Vector3(0, 0, -1);

    this.cone = this._buildConeHelper(scene);
    this.raycaster = new THREE.Raycaster();
  }

  _buildConeHelper(scene) {
    const geo = new THREE.ConeGeometry(RANGE * Math.tan(FOV / 2), RANGE, 24, 1, true);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -RANGE / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.07,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = EYE_HEIGHT;
    this.mesh.add(mesh);
    return mesh;
  }

  update(dt, player, gameState) {
    this._patrol(dt);
    const alerted = this._checkVision(player, gameState, dt);
    this.cone.material.color.setHex(alerted ? 0xff3333 : 0xffcc00);
    this.cone.material.opacity = alerted ? 0.16 : 0.07;
  }

  _patrol(dt) {
    const wp = this.waypoints[this.target];
    const dir = new THREE.Vector3().subVectors(wp, this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist < 0.15) {
      this.target = (this.target + 1) % this.waypoints.length;
      return;
    }
    dir.normalize();
    this.forward.copy(dir);
    this.mesh.position.addScaledVector(dir, SPEED * dt);
    this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
  }

  _checkVision(player, gameState, dt) {
    const eye = this.mesh.position.clone();
    eye.y += EYE_HEIGHT;
    const toPlayer = new THREE.Vector3().subVectors(player.position, eye);
    toPlayer.y = 0;
    const dist = toPlayer.length();

    const effectiveRange = gameState.flags.guardDistracted ? RANGE * 0.45 : RANGE;
    if (dist > effectiveRange) {
      gameState.addDetection(-DECAY_RATE * dt);
      return false;
    }

    const toPlayerNorm = toPlayer.clone().normalize();
    const forwardFlat = new THREE.Vector3(this.forward.x, 0, this.forward.z).normalize();
    const angle = forwardFlat.angleTo(toPlayerNorm);
    if (angle > FOV / 2) {
      gameState.addDetection(-DECAY_RATE * dt);
      return false;
    }

    // occlusion check against walls
    this.raycaster.set(eye, toPlayerNorm);
    this.raycaster.far = dist;
    const hits = this.raycaster.intersectObjects(this.occluders, false);
    if (hits.length > 0) {
      gameState.addDetection(-DECAY_RATE * dt);
      return false;
    }

    const sneakMult = player.isSneaking ? 0.4 : 1;
    const distMult = 1 - dist / effectiveRange; // closer = faster gain
    gameState.addDetection(GAIN_RATE * sneakMult * (0.3 + 0.7 * distMult) * dt);
    return true;
  }
}
