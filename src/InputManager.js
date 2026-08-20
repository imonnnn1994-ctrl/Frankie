export class InputManager {
  constructor(canvas) {
    this.keys = new Set();
    this.dragging = false;
    this.yawDelta = 0;
    this.pitchDelta = 0;
    this._lastX = 0;
    this._lastY = 0;

    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));

    canvas.addEventListener("mousedown", (e) => {
      this.dragging = true;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });
    window.addEventListener("mouseup", () => (this.dragging = false));
    window.addEventListener("mousemove", (e) => {
      if (!this.dragging) return;
      this.yawDelta += e.clientX - this._lastX;
      this.pitchDelta += e.clientY - this._lastY;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  isDown(code) {
    return this.keys.has(code);
  }

  // consumed once per frame by the camera controller
  consumeMouseDelta() {
    const d = { x: this.yawDelta, y: this.pitchDelta };
    this.yawDelta = 0;
    this.pitchDelta = 0;
    return d;
  }
}
