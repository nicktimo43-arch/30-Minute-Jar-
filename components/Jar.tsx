import React from 'react';
import type { Task } from '../types';

interface JarProps {
  tasks: Task[];
}

const Jar: React.FC<JarProps> = ({ tasks }) => {
  const [expandedTask, setExpandedTask] = React.useState<Task | null>(null);

  const ballColors: { [key in 'input' | 'output']: string } = {
    input: 'bg-yellow-400',
    output: 'bg-pink-400',
  };

  // Pre-calculate positions to avoid randomness on every render
  const ballPositions = React.useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({ // Max 50 balls for performance
      left: `${Math.random() * 75 + 10}%`,
      bottom: `${Math.random() * 60 + 5}%`,
      animationDelay: `${Math.random() * 0.5}s`,
    }));
  }, []);

  const handleBallClick = (task: Task) => {
    setExpandedTask(task);
  };

  const handleCloseExpanded = (e: React.MouseEvent) => {
    // Closes modal if the backdrop is clicked
    if (e.target === e.currentTarget) {
      setExpandedTask(null);
    }
  };

  return (
    <div className="relative w-80 h-96" aria-label="Jar with completed tasks">
      {/* Jar SVG */}
      <svg
        viewBox="0 0 100 120"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.3)' }} />
            <stop offset="20%" style={{ stopColor: 'rgba(255, 255, 255, 0.1)' }} />
            <stop offset="80%" style={{ stopColor: 'rgba(255, 255, 255, 0.1)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0.3)' }} />
          </linearGradient>
        </defs>
        {/* Jar Body */}
        <path
          d="M10 115 C 10 120, 90 120, 90 115 L 95 20 C 95 10, 5 10, 5 20 Z"
          fill="rgba(230, 240, 255, 0.4)"
          stroke="rgba(200, 220, 255, 0.6)"
          strokeWidth="2"
        />
        {/* Jar Lip */}
        <path
          d="M0 15 C 0 5, 100 5, 100 15 L 95 20 C 95 10, 5 10, 5 20 Z"
          fill="rgba(230, 240, 255, 0.6)"
          stroke="rgba(200, 220, 255, 0.8)"
          strokeWidth="1.5"
        />
        {/* Glass Shine */}
        <path d="M20 25 C 25 50, 25 80, 20 110" fill="none" stroke="url(#glassGradient)" strokeWidth="5" />
      </svg>
      
      {/* Balls Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {tasks.map((task, index) => (
          <button
            key={task.id}
            onClick={() => handleBallClick(task)}
            aria-label={`View completed task: ${task.text.substring(0, 30)}...`}
            className={`absolute w-7 h-7 rounded-full shadow-inner ${ballColors[task.type]} cursor-pointer hover:scale-110 focus:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            style={{ 
              left: ballPositions[index % ballPositions.length].left,
              bottom: ballPositions[index % ballPositions.length].bottom,
              animation: `drop 0.8s ${ballPositions[index % ballPositions.length].animationDelay} cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards`
            }}
          ></button>
        ))}
      </div>
      <style>{`
        @keyframes drop {
          0% {
            transform: translateY(-400px) scale(0.7);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          70% {
            transform: translateY(10px) scale(1.1, 0.9); /* Impact squish */
          }
          85% {
            transform: translateY(-5px) scale(0.95, 1.05); /* Bounce back */
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes unfold {
          from {
            transform: scale(0.1) rotate(-180deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>

      {/* Expanded Task Modal */}
      {expandedTask && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={handleCloseExpanded}
          role="dialog"
          aria-modal="true"
          aria-labelledby="expanded-task-title"
        >
          <div 
            className={`relative flex flex-col p-6 w-72 h-72 shadow-2xl ${expandedTask.type === 'input' ? 'bg-yellow-200' : 'bg-pink-200'}`}
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)',
              animation: 'unfold 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            }}
          >
            <h3 id="expanded-task-title" className="font-bold capitalize mb-2 border-b border-gray-500/30 w-full text-center pb-1">{expandedTask.type} Task</h3>
            <div className="flex-grow w-full bg-transparent p-2 font-serif text-gray-700 overflow-y-auto">
              <p>{expandedTask.text}</p>
            </div>
            <button 
              onClick={() => setExpandedTask(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center text-xl"
              aria-label="Close task view"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jar;
