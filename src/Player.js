import * as THREE from "three";

const WALK_SPEED = 4.2;
const SNEAK_SPEED = 2.0;
const RADIUS = 0.35;

export class Player {
  constructor(scene, spawn) {
    const geo = new THREE.CapsuleGeometry(RADIUS, 1.0, 4, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x7fd1ff, roughness: 0.5 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(spawn);
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    this.position = this.mesh.position;
    this.facing = 0; // yaw radians
    this.sneaking = false;
    this.radius = RADIUS;
  }

  get isSneaking() {
    return this.sneaking;
  }

  update(dt, input, cameraYaw, walls) {
    this.sneaking = input.isDown("ShiftLeft") || input.isDown("ShiftRight");
    const speed = this.sneaking ? SNEAK_SPEED : WALK_SPEED;

    const axis = input.getMoveAxis();
    let moveX = axis.x;
    let moveZ = axis.z;

    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.hypot(moveX, moveZ);
      moveX /= len;
      moveZ /= len;

      // move relative to camera yaw
      const sin = Math.sin(cameraYaw);
      const cos = Math.cos(cameraYaw);
      const worldX = moveX * cos - moveZ * sin;
      const worldZ = moveX * sin + moveZ * cos;

      const dx = worldX * speed * dt;
      const dz = worldZ * speed * dt;

      this._tryMove(dx, dz, walls);
      this.facing = Math.atan2(worldX, worldZ);
      this.mesh.rotation.y = this.facing;
    }
  }

  _tryMove(dx, dz, walls) {
    const next = this.position.clone();
    next.x += dx;
    if (!this._collides(next, walls)) this.position.x = next.x;

    const next2 = this.position.clone();
    next2.z += dz;
    if (!this._collides(next2, walls)) this.position.z = next2.z;
  }

  _collides(pos, walls) {
    for (const box of walls) {
      const closestX = Math.max(box.min.x, Math.min(pos.x, box.max.x));
      const closestZ = Math.max(box.min.z, Math.min(pos.z, box.max.z));
      const dx = pos.x - closestX;
      const dz = pos.z - closestZ;
      if (dx * dx + dz * dz < this.radius * this.radius) return true;
    }
    return false;
  }
}
