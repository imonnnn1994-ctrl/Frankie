export class TouchControls {
  constructor(input) {
    this.input = input;
    this.isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (!this.isTouch) return;

    document.getElementById("touch-controls").classList.remove("hidden");
    document.getElementById("app").classList.add("touch-active");
    const help = document.getElementById("crosshair-help");
    if (help) {
      help.textContent = "左侧摇杆移动 · 右侧拖动看向 · 点 E 交互 · 按住潜行减速";
    }

    this._setupJoystick();
    this._setupHoldButton("btn-interact", "KeyE");
    this._setupHoldButton("btn-sneak", "ShiftLeft");
    this._setupRestart();
  }

  _setupJoystick() {
    const base = document.getElementById("joystick-base");
    const knob = document.getElementById("joystick-knob");
    const radius = 42;
    let activeId = null;

    const update = (e) => {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        dx = (dx / dist) * radius;
        dy = (dy / dist) * radius;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.input.setJoystickVector(dx / radius, dy / radius);
    };

    const release = (e) => {
      if (e.pointerId !== activeId) return;
      activeId = null;
      knob.style.transform = "translate(0px, 0px)";
      this.input.setJoystickVector(0, 0);
    };

    base.addEventListener("pointerdown", (e) => {
      if (activeId !== null) return;
      activeId = e.pointerId;
      try {
        base.setPointerCapture(e.pointerId);
      } catch {
        // pointer wasn't eligible for capture; drag still tracked via pointerId match
      }
      update(e);
      e.preventDefault();
    });
    base.addEventListener("pointermove", (e) => {
      if (e.pointerId !== activeId) return;
      update(e);
    });
    base.addEventListener("pointerup", release);
    base.addEventListener("pointercancel", release);
  }

  _setupHoldButton(id, keyCode) {
    const btn = document.getElementById(id);
    const down = (e) => {
      e.preventDefault();
      this.input.setKey(keyCode, true);
    };
    const up = (e) => {
      e.preventDefault();
      this.input.setKey(keyCode, false);
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
  }

  _setupRestart() {
    document.getElementById("btn-restart").addEventListener("pointerdown", () => {
      window.location.reload();
    });
  }
}
