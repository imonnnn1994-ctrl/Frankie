import * as THREE from "three";
import { InputManager } from "./InputManager.js";
import { GameState, Phase } from "./GameState.js";
import { Player } from "./Player.js";
import { Guard } from "./Guard.js";
import { buildLevel } from "./level.js";
import { Interactable, makeNoteMesh } from "./Interactable.js";
import { dialogueTree } from "./dialogueData.js";
import { DialogueUI } from "./DialogueUI.js";
import { HUD } from "./HUD.js";

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e13);
scene.fog = new THREE.Fog(0x0b0e13, 14, 34);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 100);
let camYaw = 0;
const CAM_DISTANCE = 6;
const CAM_HEIGHT = 3.4;

const gameState = new GameState();
const input = new InputManager(canvas);
const level = buildLevel(scene);
const player = new Player(scene, level.spawn);
const guard = new Guard(scene, level.waypoints, level.occluders);
const dialogueUI = new DialogueUI(dialogueTree, gameState);
const hud = new HUD(gameState);

// --- interactables -------------------------------------------------------
const interactables = [];

interactables.push(
  new Interactable(
    { position: level.npcDeskPos },
    {
      radius: 2.2,
      prompt: "按 E 与前台交谈",
      onInteract: () => dialogueUI.start("start"),
      isAvailable: () => gameState.phase === Phase.PLAYING,
    }
  )
);

level.notePositions.forEach((pos, i) => {
  const mesh = makeNoteMesh(scene, pos);
  const item = new Interactable(mesh, {
    radius: 1.3,
    prompt: "按 E 查看展示卡",
    onInteract: () => {
      gameState.collectClue(i);
      scene.remove(mesh);
      const idx = interactables.indexOf(item);
      if (idx >= 0) interactables.splice(idx, 1);
    },
  });
  interactables.push(item);
});

interactables.push(
  new Interactable(
    { position: level.keypadPos },
    {
      radius: 1.6,
      prompt: () =>
        gameState.hasAllClues(3) ? "按 E 输入密码开门" : "密码面板 (还缺线索)",
      onInteract: () => {
        if (!gameState.hasAllClues(3) || gameState.flags.doorOpen) return;
        gameState.flags.doorOpen = true;
        gameState.notify();
      },
      isAvailable: () => gameState.hasAllClues(3) && !gameState.flags.doorOpen,
    }
  )
);

// --- input: interact key ---------------------------------------------------
let ePrev = false;
function handleInteract() {
  const eDown = input.isDown("KeyE");
  if (eDown && !ePrev && gameState.phase === Phase.PLAYING) {
    const nearest = findNearestInteractable();
    if (nearest) nearest.onInteract();
  }
  ePrev = eDown;
}

function findNearestInteractable() {
  let best = null;
  let bestDist = Infinity;
  for (const it of interactables) {
    if (!it.isAvailable()) continue;
    const d = it.distanceTo(player.position);
    if (d <= it.radius && d < bestDist) {
      best = it;
      bestDist = d;
    }
  }
  return best;
}

// door open animation state
let doorOpenAmount = 0;

function updatePrompt() {
  if (gameState.phase !== Phase.PLAYING) {
    hud.setPrompt(null);
    return;
  }
  const nearest = findNearestInteractable();
  if (!nearest) {
    hud.setPrompt(null);
    return;
  }
  const text = typeof nearest.prompt === "function" ? nearest.prompt() : nearest.prompt;
  hud.setPrompt(text);
}

// --- restart -----------------------------------------------------------
window.addEventListener("keydown", (e) => {
  if (e.code === "KeyR" && (gameState.phase === Phase.CAUGHT || gameState.phase === Phase.WON)) {
    window.location.reload();
  }
});

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onResize);
onResize();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  const mouse = input.consumeMouseDelta();
  camYaw -= mouse.x * 0.005;

  if (gameState.phase === Phase.PLAYING) {
    const activeWalls = gameState.flags.doorOpen ? level.walls : [...level.walls, level.doorBox];
    player.update(dt, input, camYaw, activeWalls);
    guard.update(dt, player, gameState);
    handleInteract();
    updatePrompt();

    if (gameState.flags.doorOpen && doorOpenAmount < 1) {
      doorOpenAmount = Math.min(1, doorOpenAmount + dt * 0.6);
      level.door.position.y = 1.5 + doorOpenAmount * 3;
    }

    if (gameState.flags.doorOpen) {
      const playerBox = new THREE.Box3().setFromCenterAndSize(
        player.position,
        new THREE.Vector3(0.6, 1.6, 0.6)
      );
      if (playerBox.intersectsBox(level.winZone)) {
        gameState.phase = Phase.WON;
        gameState.notify();
      }
    }
  } else {
    hud.setPrompt(null);
  }

  // camera follow
  const camOffset = new THREE.Vector3(
    -Math.sin(camYaw) * CAM_DISTANCE,
    CAM_HEIGHT,
    Math.cos(camYaw) * CAM_DISTANCE
  );
  camera.position.copy(player.position).add(camOffset);
  camera.lookAt(
    player.position.x,
    player.position.y + 1,
    player.position.z
  );

  renderer.render(scene, camera);
}

animate();

if (import.meta.env.DEV) {
  window.__game = { scene, camera, player, guard, gameState, level, interactables };
}
