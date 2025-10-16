// FIX: Removed self-import of `Task` and `ActiveTask`. These types are defined
// within this file and importing them from "." causes circular dependency errors.
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

export interface SyncPayload {
    mainTask: string;
    completedTasks: Task[];
    plannedTasks: Task[];
}

export interface WeeklyRecord {
    weekOf: string; // Stored as YYYY-MM-DD
    count: number;
}

export type PlantShape = number[][];

export interface PlantStyle {
    leafShape: PlantShape;
    flowerShape: PlantShape;
}