import { homedir } from "os";
import { join } from "path";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";

const STATE_DIR = join(homedir(), ".granola-cli");
const STATE_FILE = join(STATE_DIR, "state.json");

interface DebriefEntry {
  at: string;
}

interface State {
  debriefed: Record<string, DebriefEntry>;
}

function ensureDir(): void {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
}

export function readState(): State {
  ensureDir();
  if (!existsSync(STATE_FILE)) {
    return { debriefed: {} };
  }
  return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
}

function writeState(state: State): void {
  ensureDir();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

export function markDebriefed(meetingId: string): void {
  const state = readState();
  state.debriefed[meetingId] = { at: new Date().toISOString() };
  writeState(state);
}

export function unmarkDebriefed(meetingId: string): void {
  const state = readState();
  delete state.debriefed[meetingId];
  writeState(state);
}

export function isDebriefed(meetingId: string): boolean {
  const state = readState();
  return meetingId in state.debriefed;
}
