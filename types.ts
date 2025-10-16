export type NoteType = 'input' | 'output';

export type TimerState = 'idle' | 'running' | 'paused';

export interface Task {
  id: number;
  type: NoteType;
  text: string;
}

export interface ActiveTask {
  id: number;
  type: NoteType;
  text: string;
}
