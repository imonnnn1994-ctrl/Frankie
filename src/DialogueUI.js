import { Phase } from "./GameState.js";

export class DialogueUI {
  constructor(tree, gameState) {
    this.tree = tree;
    this.gameState = gameState;
    this.box = document.getElementById("dialogue-box");
    this.speakerEl = document.getElementById("dialogue-speaker");
    this.textEl = document.getElementById("dialogue-text");
    this.choicesEl = document.getElementById("dialogue-choices");
    this.currentNode = null;
    this.active = false;

    window.addEventListener("keydown", (e) => {
      if (!this.active) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num)) this._selectByIndex(num - 1);
    });
  }

  start(nodeId = "start") {
    this.active = true;
    this.gameState.phase = Phase.DIALOGUE;
    this.box.classList.remove("hidden");
    this._render(nodeId);
  }

  _render(nodeId) {
    const node = this.tree[nodeId];
    this.currentNode = node;
    this.speakerEl.textContent = node.speaker;
    this.textEl.textContent = node.text;
    this.choicesEl.innerHTML = "";

    node.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.className = "dialogue-choice";
      btn.innerHTML = `<span class="key-hint">${i + 1}</span>${choice.label}`;
      btn.addEventListener("click", () => this._select(choice));
      this.choicesEl.appendChild(btn);
    });
  }

  _selectByIndex(i) {
    const choice = this.currentNode?.choices[i];
    if (choice) this._select(choice);
  }

  _select(choice) {
    if (choice.effect) choice.effect(this.gameState);
    if (choice.next) {
      this._render(choice.next);
    } else {
      this.close();
    }
  }

  close() {
    this.active = false;
    this.box.classList.add("hidden");
    this.gameState.phase = Phase.PLAYING;
    this.gameState.notify();
  }
}
