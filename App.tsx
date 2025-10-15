import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NoteType, Task, TimerState, ActiveTask } from './types';
import Statistics from './components/Statistics';
import Jar from './components/Jar';
import StickyNote from './components/StickyNote';
import TimerScreen from './components/TimerScreen';
import PauseOverlay from './components/PauseOverlay';

const TOTAL_TIME = 30 * 60; // 30 minutes in seconds
const TASKS_STORAGE_KEY = 'focusJarTasks';
const TIMER_STATE_STORAGE_KEY = 'focusJarTimerState';

export default function App(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = window.localStorage.getItem(TASKS_STORAGE_KEY);
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Failed to parse tasks from localStorage:", error);
      return [];
    }
  });

  const [inputNoteText, setInputNoteText] = useState('');
  const [outputNoteText, setOutputNoteText] = useState('');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [totalPausedDuration, setTotalPausedDuration] = useState(0);

  // Load timer state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedStateJSON = window.localStorage.getItem(TIMER_STATE_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);

        if (savedState.timerState === 'idle') {
          window.localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
          return;
        }

        const rehydratedEndTime = savedState.endTime ? new Date(savedState.endTime) : null;

        if (rehydratedEndTime && rehydratedEndTime.getTime() < Date.now()) {
          // Timer finished while the tab was closed. Complete the task.
          if (savedState.activeTask) {
            setTasks((prevTasks) => [...prevTasks, { id: Date.now(), type: savedState.activeTask.type, text: savedState.activeTask.text }]);
          }
          window.localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
        } else {
          // Restore the timer state
          const rehydratedStartTime = savedState.startTime ? new Date(savedState.startTime) : null;
          setActiveTask(savedState.activeTask);
          setTimerState(savedState.timerState);
          setStartTime(rehydratedStartTime);
          setEndTime(rehydratedEndTime);
          setTotalPausedDuration(savedState.totalPausedDuration);
          setPauseStartTime(savedState.pauseStartTime);

          if (savedState.timerState === 'running' && rehydratedEndTime) {
            const newTimeRemaining = Math.max(0, Math.round((rehydratedEndTime.getTime() - Date.now()) / 1000));
            setTimeRemaining(newTimeRemaining);
          } else { // State was 'paused'
            setTimeRemaining(savedState.timeRemaining);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load timer state:", error);
      window.localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
    }
  }, [setTasks]); // Run only once on mount, setTasks is a stable function

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (timerState === 'idle' || !activeTask) {
      window.localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
      return;
    }

    const stateToSave = {
      timerState,
      timeRemaining,
      activeTask,
      startTime: startTime?.toISOString(),
      endTime: endTime?.toISOString(),
      pauseStartTime,
      totalPausedDuration,
    };

    try {
      window.localStorage.setItem(TIMER_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save timer state:", error);
    }
  }, [timerState, timeRemaining, activeTask, startTime, endTime, pauseStartTime, totalPausedDuration]);

  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error);
    }
  }, [tasks]);

  const handlePlay = useCallback((type: NoteType, text: string) => {
    if (text.trim()) {
      const now = new Date();
      setActiveTask({ type, text });
      setTimerState('running');
      setTimeRemaining(TOTAL_TIME);
      setStartTime(now);
      setEndTime(new Date(now.getTime() + TOTAL_TIME * 1000));
      setPauseStartTime(null);
      setTotalPausedDuration(0);
    }
  }, []);

  const handlePause = useCallback(() => {
    if (timerState === 'running') {
      setTimerState('paused');
      setPauseStartTime(Date.now()); // Record when pause starts
    }
  }, [timerState]);

  const handleResume = useCallback(() => {
    if (timerState === 'paused' && pauseStartTime && startTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      const newTotalPausedDuration = totalPausedDuration + pauseDuration;
      setTotalPausedDuration(newTotalPausedDuration);
      
      // Recalculate endTime to account for the pause
      const newEndTime = new Date(startTime.getTime() + TOTAL_TIME * 1000 + newTotalPausedDuration);
      setEndTime(newEndTime);

      setPauseStartTime(null);
      setTimerState('running');
    }
  }, [timerState, pauseStartTime, startTime, totalPausedDuration]);

  const handleDone = useCallback(() => {
    if (timeRemaining > 0) {
      setErrorMessage('You are not done, please finish your tasks.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  }, [timeRemaining]);

  const resetToIdle = useCallback(() => {
      if(activeTask?.type === 'input') {
          setInputNoteText('');
      } else {
          setOutputNoteText('');
      }
      setActiveTask(null);
      setTimerState('idle');
      setTimeRemaining(TOTAL_TIME);
      setStartTime(null);
      setEndTime(null);
  }, [activeTask]);

  useEffect(() => {
    let interval: number | undefined;

    if (timerState === 'running') {
      interval = window.setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            if (activeTask) {
              setTasks((prevTasks) => [...prevTasks, { id: Date.now(), type: activeTask.type, text: activeTask.text }]);
            }
            resetToIdle();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerState, activeTask, resetToIdle, setTasks]);


  const memoizedStats = useMemo(() => <Statistics tasks={tasks} />, [tasks]);

  const isTaskActive = timerState !== 'idle';

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {memoizedStats}
      
      {errorMessage && (
        <div className="absolute top-5 bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce">
          {errorMessage}
        </div>
      )}

      {isTaskActive && activeTask && startTime && endTime ? (
        <TimerScreen
          timeRemaining={timeRemaining}
          totalTime={TOTAL_TIME}
          onPause={handlePause}
          onDone={handleDone}
          taskText={activeTask.text}
          startTime={startTime}
          endTime={endTime}
        />
      ) : (
        <>
          <Jar tasks={tasks} />
          <div className="flex flex-row items-start justify-center gap-8 mt-8">
            <StickyNote
              noteType="input"
              color="bg-yellow-200"
              text={inputNoteText}
              onTextChange={setInputNoteText}
              onPlay={handlePlay}
              isAnotherTaskActive={isTaskActive}
            />
            <StickyNote
              noteType="output"
              color="bg-pink-200"
              text={outputNoteText}
              onTextChange={setOutputNoteText}
              onPlay={handlePlay}
              isAnotherTaskActive={isTaskActive}
            />
          </div>
        </>
      )}

      {timerState === 'paused' && <PauseOverlay onResume={handleResume} />}
    </div>
  );
}