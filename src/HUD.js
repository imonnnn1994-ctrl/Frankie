import { Phase } from "./GameState.js";

const TOTAL_CLUES = 3;

export class HUD {
  constructor(gameState) {
    this.gameState = gameState;
    this.fill = document.getElementById("detection-fill");
    this.objective = document.getElementById("objective");
    this.prompt = document.getElementById("prompt");
    this.caughtOverlay = document.getElementById("caught-overlay");
    this.caughtText = document.getElementById("caught-text");
    this.caughtSub = document.getElementById("caught-sub");
    this.restartBtn = document.getElementById("btn-restart");
    gameState.onChange((gs) => this.render(gs));
    this.render(gameState);
  }

  setPrompt(text) {
    if (!text) {
      this.prompt.classList.add("hidden");
      return;
    }
    this.prompt.textContent = text;
    this.prompt.classList.remove("hidden");
  }

  render(gs) {
    this.fill.style.width = `${gs.detection}%`;

    if (gs.phase === Phase.CAUGHT || gs.phase === Phase.WON) {
      this.caughtOverlay.classList.remove("hidden");
      this.restartBtn.classList.remove("hidden");
      if (gs.phase === Phase.CAUGHT) {
        this.caughtOverlay.classList.remove("won");
        this.caughtText.textContent = "你被发现了!";
        this.caughtSub.textContent = "按 R 或点击下方按钮重新开始";
      } else {
        this.caughtOverlay.classList.add("won");
        this.caughtText.textContent = "成功逃脱!";
        this.caughtSub.textContent = "你穿过了后门 · 按 R 或点击下方按钮重新开始";
      }
    } else {
      this.caughtOverlay.classList.add("hidden");
    }

    if (gs.phase === Phase.WON) {
      this.objective.textContent = "已逃脱!你成功穿过了后门。";
      return;
    }

    if (gs.clues.length < TOTAL_CLUES) {
      this.objective.textContent = `目标: 收集展示卡线索 (${gs.clues.length}/${TOTAL_CLUES}),躲避保安巡逻`;
    } else {
      this.objective.textContent = "目标: 线索已集齐,前往后门的密码面板";
    }
  }
}
