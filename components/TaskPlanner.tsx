import React, { useState } from 'react';
import { NoteType, Task } from '../types';

interface TaskPlannerProps {
  initialTasks?: Task[];
  onSavePlan: (tasks: Task[]) => void;
  onCancelEdit?: () => void;
}

const RemoveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const TaskPlanner: React.FC<TaskPlannerProps> = ({ initialTasks, onSavePlan, onCancelEdit }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [currentText, setCurrentText] = useState('');

  const nextTaskType: NoteType = tasks.length % 2 === 0 ? 'input' : 'output';

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentText.trim()) {
      setTasks([...tasks, { text: currentText.trim(), type: nextTaskType, id: Date.now() }]);
      setCurrentText('');
    }
  };

  const handleRemoveTask = (idToRemove: number) => {
    const filteredTasks = tasks.filter(task => task.id !== idToRemove);
    
    // Re-assign types to enforce the alternating pattern
    const retypedTasks = filteredTasks.map((task, index): Task => ({
      ...task,
      type: index % 2 === 0 ? 'input' : 'output',
    }));

    setTasks(retypedTasks);
  };

  const handleSave = () => {
    if (tasks.length > 0) {
      onSavePlan(tasks);
    }
  };

  const noteTitle = nextTaskType === 'input' ? 'Consume' : 'Produce';
  const placeholderText = nextTaskType === 'input' 
    ? "e.g., Read a book chapter" 
    : "e.g., Write a document";

  return (
    <div className="border border-black rounded-lg p-4 flex flex-col w-full space-y-3">
      <h3 className="font-semibold text-md text-black">{onCancelEdit ? 'Edit Your Plan' : 'Plan Your Session'}</h3>
      
      {tasks.length > 0 && (
        <ul className="space-y-1 max-h-24 overflow-y-auto pr-2 border-t border-b py-1">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between p-1 text-sm">
              <span className="font-medium text-xs uppercase w-16 text-gray-500">
                {task.type === 'input' ? 'Consume' : 'Produce'}
              </span>
              <span className="flex-1 mx-2 truncate text-black">{task.text}</span>
              <button onClick={() => handleRemoveTask(task.id)} className="text-gray-500 hover:text-red-500 p-1 rounded-full transition-colors">
                <RemoveIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddTask} className="space-y-2">
        <label className="font-medium text-sm text-gray-600">Next: <span className="text-black font-semibold">{noteTitle}</span></label>
        <textarea
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder={placeholderText}
          className="w-full bg-white rounded-md resize-none focus:outline-none p-2 font-sans text-black border border-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          rows={2}
          aria-label="New task input"
        />
        <button type="submit" className={`w-full px-4 py-1.5 rounded-md font-semibold text-sm transition-all duration-300 ${currentText.trim() ? 'bg-black text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`} disabled={!currentText.trim()}>
          Add Task
        </button>
      </form>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleSave}
          disabled={tasks.length === 0}
          className="w-full px-4 py-2 rounded-md font-bold text-white shadow-sm transition-all duration-300 bg-black disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {onCancelEdit ? 'Update' : 'Save Plan'}
        </button>

        {onCancelEdit && (
            <button
                onClick={onCancelEdit}
                className="w-full px-4 py-2 rounded-md font-semibold text-black bg-gray-200 hover:bg-gray-300 transition-colors"
            >
                Cancel
            </button>
        )}
      </div>
    </div>
  );
};

export default TaskPlanner;