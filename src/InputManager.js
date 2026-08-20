export class InputManager {
  constructor(canvas) {
    this.keys = new Set();
    this.yawDelta = 0;
    this.pitchDelta = 0;
    this.joystickVec = { x: 0, z: 0 };
    this._lookPointerId = null;
    this._lastX = 0;
    this._lastY = 0;

    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));

    // Pointer Events cover both mouse-drag and touch-drag for camera look.
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", (e) => {
      if (this._lookPointerId !== null) return;
      this._lookPointerId = e.pointerId;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // pointer wasn't eligible for capture; drag still tracked via pointerId match
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerId !== this._lookPointerId) return;
      this.yawDelta += e.clientX - this._lastX;
      this.pitchDelta += e.clientY - this._lastY;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });
    const endLook = (e) => {
      if (e.pointerId !== this._lookPointerId) return;
      this._lookPointerId = null;
    };
    canvas.addEventListener("pointerup", endLook);
    canvas.addEventListener("pointercancel", endLook);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  isDown(code) {
    return this.keys.has(code);
  }

  // lets on-screen touch buttons behave exactly like held keyboard keys
  setKey(code, isDown) {
    if (isDown) this.keys.add(code);
    else this.keys.delete(code);
  }

  setJoystickVector(x, z) {
    this.joystickVec.x = x;
    this.joystickVec.z = z;
  }

  // movement axis: virtual joystick takes priority over WASD when active
  getMoveAxis() {
    const { x, z } = this.joystickVec;
    if (Math.hypot(x, z) > 0.15) return { x, z };

    let ax = 0;
    let az = 0;
    if (this.isDown("KeyW")) az -= 1;
    if (this.isDown("KeyS")) az += 1;
    if (this.isDown("KeyA")) ax -= 1;
    if (this.isDown("KeyD")) ax += 1;
    return { x: ax, z: az };
  }

  // consumed once per frame by the camera controller
  consumeMouseDelta() {
    const d = { x: this.yawDelta, y: this.pitchDelta };
    this.yawDelta = 0;
    this.pitchDelta = 0;
    return d;
  }
}
