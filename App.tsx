import React, { useState, useEffect, useCallback } from 'react';
import { Task, TimerState, ActiveTask, SyncPayload } from './types';
import Jar from './components/Jar';
import TimerScreen from './components/TimerScreen';
import MainTaskNote from './components/MainTaskNote';
import TaskPlanner from './components/TaskPlanner';
import NextUp from './components/NextUp';
import QrCodeModal from './components/QrCodeModal';
import QrScanner from './components/QrScanner';

const TOTAL_TIME = 30 * 60; // 30 minutes in seconds
const COMPLETED_TASKS_STORAGE_KEY = 'focusJarCompletedTasks';
const PLANNED_TASKS_STORAGE_KEY = 'focusJarPlannedTasks';
const TIMER_STATE_STORAGE_KEY = 'focusJarTimerState';
const MAIN_TASK_STORAGE_KEY = 'focusJarMainTask';
const MONEY_STORAGE_KEY = 'focusJarMoney';

export default function App(): React.ReactElement {
  const [completedTasks, setCompletedTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = window.localStorage.getItem(COMPLETED_TASKS_STORAGE_KEY);
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Failed to parse completed tasks from localStorage:", error);
      return [];
    }
  });
  
  const [plannedTasks, setPlannedTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = window.localStorage.getItem(PLANNED_TASKS_STORAGE_KEY);
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Failed to parse planned tasks from localStorage:", error);
      return [];
    }
  });

  const [moneyEarned, setMoneyEarned] = useState<number>(() => {
    try {
      const savedMoney = window.localStorage.getItem(MONEY_STORAGE_KEY);
      return savedMoney ? JSON.parse(savedMoney) : 0;
    } catch (error) {
      console.error("Failed to parse money from localStorage:", error);
      return 0;
    }
  });

  const [mainTask, setMainTask] = useState<string>(() => {
    try {
      const savedMainTask = window.localStorage.getItem(MAIN_TASK_STORAGE_KEY);
      return savedMainTask ? JSON.parse(savedMainTask) : '';
    } catch (error) {
      console.error("Failed to load main task from localStorage:", error);
      return '';
    }
  });

  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);
  
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [totalPausedDuration, setTotalPausedDuration] = useState(0);
  
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  // Save main task to localStorage
  useEffect(() => {
    try {
        window.localStorage.setItem(MAIN_TASK_STORAGE_KEY, JSON.stringify(mainTask));
    } catch (error) {
        console.error("Failed to save main task to localStorage:", error);
    }
  }, [mainTask]);
  
  // Save money to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(MONEY_STORAGE_KEY, JSON.stringify(moneyEarned));
    } catch (error) {
      console.error("Failed to save money to localStorage:", error);
    }
  }, [moneyEarned]);

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
            setCompletedTasks((prevTasks) => [...prevTasks, { id: savedState.activeTask.id, type: savedState.activeTask.type, text: savedState.activeTask.text }]);
            // Also remove from planned tasks
            setPlannedTasks((prev) => prev.filter(task => task.id !== savedState.activeTask.id));
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
  }, []); // Run only once on mount

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
      window.localStorage.setItem(COMPLETED_TASKS_STORAGE_KEY, JSON.stringify(completedTasks));
    } catch (error) {
      console.error("Failed to save completed tasks to localStorage:", error);
    }
  }, [completedTasks]);
  
  useEffect(() => {
    try {
      window.localStorage.setItem(PLANNED_TASKS_STORAGE_KEY, JSON.stringify(plannedTasks));
    } catch (error) {
      console.error("Failed to save planned tasks to localStorage:", error);
    }
  }, [plannedTasks]);

  const handleSellGumball = useCallback(() => {
    if (completedTasks.length > 0) {
      setMoneyEarned(prevMoney => prevMoney + 1);
      setCompletedTasks(prevTasks => prevTasks.slice(1));
    }
  }, [completedTasks]);

  const handleSavePlan = useCallback((newTasks: Task[]) => {
    const tasksWithGuaranteedIds = newTasks.map((task, index) => ({
      ...task,
      id: task.id || Date.now() + index,
    }));
    setPlannedTasks(tasksWithGuaranteedIds);
    setIsEditingPlan(false);
  }, []);
  
  const handlePlay = useCallback(() => {
    if (plannedTasks.length > 0) {
      const nextTask = plannedTasks[0];
      const now = new Date();
      setActiveTask(nextTask);
      setTimerState('running');
      setTimeRemaining(TOTAL_TIME);
      setStartTime(now);
      setEndTime(new Date(now.getTime() + TOTAL_TIME * 1000));
      setPauseStartTime(null);
      setTotalPausedDuration(0);
    }
  }, [plannedTasks]);

  const handlePause = useCallback(() => {
    if (timerState === 'running') {
      setTimerState('paused');
      setPauseStartTime(Date.now());
    }
  }, [timerState]);

  const handleResume = useCallback(() => {
    if (timerState === 'paused' && pauseStartTime && startTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      const newTotalPausedDuration = totalPausedDuration + pauseDuration;
      setTotalPausedDuration(newTotalPausedDuration);
      
      const newEndTime = new Date(startTime.getTime() + TOTAL_TIME * 1000 + newTotalPausedDuration);
      setEndTime(newEndTime);

      setPauseStartTime(null);
      setTimerState('running');
    }
  }, [timerState, pauseStartTime, startTime, totalPausedDuration]);

  const handleCancel = useCallback(() => {
    setActiveTask(null);
    setTimerState('idle');
    setTimeRemaining(TOTAL_TIME);
    setStartTime(null);
    setEndTime(null);
  }, []);

  const resetToIdle = useCallback(() => {
      setActiveTask(null);
      setTimerState('idle');
      setTimeRemaining(TOTAL_TIME);
      setStartTime(null);
      setEndTime(null);
  }, []);
  
  const handleEditPlan = useCallback(() => setIsEditingPlan(true), []);
  const handleCancelEdit = useCallback(() => setIsEditingPlan(false), []);

  const handleQrScanSuccess = useCallback((data: string) => {
    try {
        const payload: SyncPayload = JSON.parse(data);
        if (window.confirm("Syncing will replace all data on this device. Continue?")) {
            setMainTask(payload.mainTask);
            setCompletedTasks(payload.completedTasks);
            setPlannedTasks(payload.plannedTasks);
            setMoneyEarned(payload.moneyEarned);
        }
    } catch (e) {
        console.error("Failed to parse QR code data:", e);
        alert("Invalid QR code format.");
    } finally {
        setShowQrScanner(false);
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    if (timerState === 'running') {
      interval = window.setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            if (activeTask) {
              setCompletedTasks((prevTasks) => [...prevTasks, { id: activeTask.id, type: activeTask.type, text: activeTask.text }]);
              setPlannedTasks((prev) => prev.filter(task => task.id !== activeTask.id));
            }
            resetToIdle();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerState, activeTask, resetToIdle]);
  
  const isTaskActive = timerState !== 'idle';
  const showPlanner = plannedTasks.length === 0 || isEditingPlan;

  const syncPayload: SyncPayload = { mainTask, completedTasks, plannedTasks, moneyEarned };

  return (
    <div className="bg-white h-screen overflow-hidden font-sans text-black w-full flex flex-col items-center p-4">
       <div className="fixed top-4 right-4 z-20 flex items-center space-x-2">
            <div className="bg-white rounded-md px-3 py-1 border border-gray-300">
                <p className="text-md font-semibold text-black flex items-center">
                    ${moneyEarned}
                </p>
            </div>
            <div className="relative group">
                 <button className="bg-white rounded-md p-2 border border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v2.958a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V4.5a1.5 1.5 0 0 1 1.5-1.5h2.958a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H4.5ZM10 3.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1ZM11.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM2 11.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1Zm2.5.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1ZM8.5 12a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1Zm2.5 0a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1ZM8.5 10a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1Zm2.5 0a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1Zm-7-2.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1ZM6 8.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1Z"/>
                    </svg>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-focus-within:pointer-events-auto group-hover:pointer-events-auto">
                    <button onClick={() => setShowQrModal(true)} className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100">Show My Code</button>
                    <button onClick={() => setShowQrScanner(true)} className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100">Scan Code</button>
                </div>
            </div>
      </div>


      <main className="w-full max-w-sm mx-auto flex flex-col items-center flex-grow justify-around">
        <div className="w-full flex items-center justify-between space-x-4">
          <div className="flex-1">
            <MainTaskNote 
                text={mainTask}
                onTextChange={setMainTask}
                isTaskActive={isTaskActive}
            />
          </div>
          <Jar tasks={completedTasks} onSell={handleSellGumball} />
        </div>

        <div className={`w-full transition-opacity duration-300 ${isTaskActive ? 'opacity-25 pointer-events-none' : 'opacity-100'}`}>
          {showPlanner ? (
             <TaskPlanner
              initialTasks={plannedTasks}
              onSavePlan={handleSavePlan}
              onCancelEdit={plannedTasks.length > 0 && isEditingPlan ? handleCancelEdit : undefined}
            />
          ) : (
            <NextUp
              task={plannedTasks[0]}
              queue={plannedTasks.slice(1)}
              onPlay={handlePlay}
              isAnotherTaskActive={isTaskActive}
              onEditPlan={handleEditPlan}
            />
          )}
        </div>
      </main>

      {isTaskActive && activeTask && (
        <TimerScreen
          timeRemaining={timeRemaining}
          totalTime={TOTAL_TIME}
          timerState={timerState}
          onPause={handlePause}
          onResume={handleResume}
          onCancel={handleCancel}
          taskText={activeTask.text}
        />
      )}
      {showQrModal && <QrCodeModal data={JSON.stringify(syncPayload)} onClose={() => setShowQrModal(false)} />}
      {showQrScanner && <QrScanner onScanSuccess={handleQrScanSuccess} onCancel={() => setShowQrScanner(false)} />}
    </div>
  );
}