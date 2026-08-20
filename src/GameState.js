export const Phase = {
  PLAYING: "playing",
  DIALOGUE: "dialogue",
  CAUGHT: "caught",
  WON: "won",
};

export class GameState {
  constructor() {
    this.phase = Phase.PLAYING;
    this.detection = 0; // 0..100
    this.clues = []; // collected code digits, in order
    this.flags = {
      guardDistracted: false,
      askedAboutArtifact: false,
      liedAboutId: false,
      doorOpen: false,
    };
    this.distractionTimer = 0;
    this.listeners = [];
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  notify() {
    for (const fn of this.listeners) fn(this);
  }

  addDetection(amount) {
    this.detection = Math.min(100, Math.max(0, this.detection + amount));
    if (this.detection >= 100 && this.phase === Phase.PLAYING) {
      this.phase = Phase.CAUGHT;
    }
    this.notify();
  }

  collectClue(digit) {
    if (this.clues.includes(digit)) return;
    this.clues.push(digit);
    this.notify();
  }

  hasAllClues(total) {
    return this.clues.length >= total;
  }
}
