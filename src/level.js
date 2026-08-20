import * as THREE from "three";

const WALL_H = 3;
const WALL_MAT = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.9 });
const FLOOR_MAT = new THREE.MeshStandardMaterial({ color: 0x14181d, roughness: 1 });
const PILLAR_MAT = new THREE.MeshStandardMaterial({ color: 0x3a4048, roughness: 0.8 });
const DOOR_MAT = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.6 });
const DESK_MAT = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 });

function addWallBox(scene, walls, occluders, cx, cz, sx, sz, h = WALL_H, mat = WALL_MAT) {
  const geo = new THREE.BoxGeometry(sx, h, sz);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(cx, h / 2, cz);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
  occluders.push(mesh);
  walls.push(
    new THREE.Box3(
      new THREE.Vector3(cx - sx / 2, 0, cz - sz / 2),
      new THREE.Vector3(cx + sx / 2, h, cz + sz / 2)
    )
  );
  return mesh;
}

export function buildLevel(scene) {
  const walls = [];
  const occluders = [];

  // floor (main lobby + back room)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), FLOOR_MAT);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Lobby: 20 (x) by 14 (z), centered at origin, door gap on +z wall (north-ish, "back")
  const halfW = 10;
  const halfD = 7;

  // south wall (entrance side) with a gap in the middle (open entrance)
  addWallBox(scene, walls, occluders, -halfW + 2.5, -halfD, 5, 0.4);
  addWallBox(scene, walls, occluders, halfW - 2.5, -halfD, 5, 0.4);
  // north wall (back) with a gap for the back door
  addWallBox(scene, walls, occluders, -halfW + 4, halfD, 12, 0.4);
  addWallBox(scene, walls, occluders, halfW - 3, halfD, 8, 0.4);
  // east / west walls
  addWallBox(scene, walls, occluders, -halfW, 0, 0.4, halfD * 2);
  addWallBox(scene, walls, occluders, halfW, 0, 0.4, halfD * 2);

  // cover pillars
  addWallBox(scene, walls, occluders, -3, -1, 1.2, 1.2, WALL_H, PILLAR_MAT);
  addWallBox(scene, walls, occluders, 2.5, 1.5, 1.2, 1.2, WALL_H, PILLAR_MAT);
  addWallBox(scene, walls, occluders, -1, 3.5, 1.2, 1.2, WALL_H, PILLAR_MAT);

  // reception desk (near entrance, west side)
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1), DESK_MAT);
  desk.position.set(-7.5, 0.55, -4.5);
  desk.castShadow = true;
  scene.add(desk);
  occluders.push(desk);
  walls.push(
    new THREE.Box3(
      new THREE.Vector3(-7.5 - 1.2, 0, -4.5 - 0.5),
      new THREE.Vector3(-7.5 + 1.2, 1.1, -4.5 + 0.5)
    )
  );

  const receptionist = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 1.0, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd27f })
  );
  receptionist.position.set(-7.5, 1.05, -5.6);
  scene.add(receptionist);

  // back door (slides up when opened) — blocks movement until doorOpen flag is set
  const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3, 0.35), DOOR_MAT);
  door.position.set(1, 1.5, halfD);
  door.castShadow = true;
  scene.add(door);
  occluders.push(door);
  const doorBox = new THREE.Box3(
    new THREE.Vector3(1 - 1.6, 0, halfD - 0.2),
    new THREE.Vector3(1 + 1.6, WALL_H, halfD + 0.2)
  );

  // keypad panel beside the door
  const keypad = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.5, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1c2530, emissive: 0x113355, emissiveIntensity: 0.4 })
  );
  keypad.position.set(2.9, 1.2, halfD - 0.1);
  scene.add(keypad);

  // ambient light + directional
  scene.add(new THREE.AmbientLight(0x8899aa, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(8, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const notePositions = [
    new THREE.Vector3(-3, 0, -2.2),
    new THREE.Vector3(3.5, 0, 3.3),
    new THREE.Vector3(-1.6, 0, 5.2),
  ];

  const waypoints = [
    new THREE.Vector3(-5, 0, 2),
    new THREE.Vector3(-3, 0, -1),
    new THREE.Vector3(3, 0, -2),
    new THREE.Vector3(4, 0, 4),
    new THREE.Vector3(-1, 0, 5),
  ];

  return {
    walls,
    occluders,
    waypoints,
    spawn: new THREE.Vector3(0, 1, -6),
    npcDeskPos: new THREE.Vector3(-7.5, 0, -5.6),
    notePositions,
    keypadPos: keypad.position.clone(),
    door,
    doorBox,
    winZone: new THREE.Box3(
      new THREE.Vector3(-1, 0, halfD + 0.5),
      new THREE.Vector3(3, 2.2, halfD + 3.5)
    ),
  };
}
