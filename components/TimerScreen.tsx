import React from 'react';

interface TimerScreenProps {
  timeRemaining: number;
  totalTime: number;
  onPause: () => void;
  onDone: () => void;
  taskText: string;
  startTime: Date;
  endTime: Date;
}

const playClickSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error("Could not play sound:", error);
  }
};

const playDoneSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;
    const now = audioContext.currentTime;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5); // Decay
    gainNode.connect(audioContext.destination);

    // First oscillator for main tone
    const oscillator1 = audioContext.createOscillator();
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(880, now); // A5
    oscillator1.connect(gainNode);

    // Second oscillator for a harmonic overtone
    const oscillator2 = audioContext.createOscillator();
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(1318.51, now); // E6

    oscillator2.connect(gainNode);
    
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 0.5);
    oscillator2.stop(now + 0.5);
  } catch (error)
 {
    console.error("Could not play done sound:", error);
  }
};

interface WallClockProps {
  startTime: Date;
  endTime: Date;
}

const WallClock: React.FC<WallClockProps> = ({ startTime, endTime }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const seconds = currentTime.getSeconds();
  const minutes = currentTime.getMinutes();
  const hours = currentTime.getHours();

  const secondHandRotation = seconds * 6;
  const minuteHandRotation = minutes * 6 + seconds * 0.1;
  const hourHandRotation = (hours % 12) * 30 + minutes * 0.5;

  const endMinutes = endTime.getMinutes();
  const endSeconds = endTime.getSeconds();
  const endMarkerRotation = endMinutes * 6 + endSeconds * 0.1;

  // Function to generate the SVG path for a pie slice
  const describePieSlice = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
      const getCoords = (angle: number) => {
          const angleInRadians = (angle - 90) * Math.PI / 180;
          return {
              x: x + radius * Math.cos(angleInRadians),
              y: y + radius * Math.sin(angleInRadians)
          };
      };

      const start = getCoords(startAngle);
      const end = getCoords(endAngle);

      let angleDiff = endAngle - startAngle;
      if (angleDiff <= 0) { // Handles wrap-around (e.g., from 50min to 20min)
          angleDiff += 360;
      }
      const largeArcFlag = angleDiff <= 180 ? '0' : '1';

      const d = [
          'M', start.x, start.y,
          'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y,
          'L', x, y,
          'L', start.x, start.y,
          'Z'
      ].join(' ');

      return d;
  };

  // Generate the highlight path
  let highlightPath = '';
  const now = currentTime.getTime();
  if (now >= startTime.getTime() && now < endTime.getTime()) {
      highlightPath = describePieSlice(50, 50, 48, minuteHandRotation, endMarkerRotation);
  }


  return (
    <div className="w-80 h-80 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Clock Face */}
        <circle cx="50" cy="50" r="48" fill="white" stroke="#333" strokeWidth="2" />

        {/* Highlight Path */}
        <path d={highlightPath} fill="#22c55e" fillOpacity="0.2" />

        {/* Hour and Minute Markers */}
        {Array.from({ length: 60 }).map((_, i) => (
          <line
            key={i}
            x1="50"
            y1={i % 5 === 0 ? "8" : "5"}
            x2="50"
            y2="10"
            stroke="#333"
            strokeWidth={i % 5 === 0 ? "1" : "0.5"}
            transform={`rotate(${i * 6} 50 50)`}
          />
        ))}

        {/* End Time Marker */}
        <rect
          x="49.5"
          y="4"
          width="1"
          height="5"
          rx="0.5"
          fill="#ef4444" // red-500
          transform={`rotate(${endMarkerRotation} 50 50)`}
        />

        {/* Numbers */}
        <text x="50" y="20" textAnchor="middle" dominantBaseline="central" fontSize="10" fontFamily="monospace">12</text>
        <text x="80" y="50" textAnchor="middle" dominantBaseline="central" fontSize="10" fontFamily="monospace">3</text>
        <text x="50" y="80" textAnchor="middle" dominantBaseline="central" fontSize="10" fontFamily="monospace">6</text>
        <text x="20" y="50" textAnchor="middle" dominantBaseline="central" fontSize="10" fontFamily="monospace">9</text>

        {/* Hour Hand (shorter, thicker) */}
        <rect
          x="49"
          y="25"
          width="2"
          height="25"
          rx="1"
          fill="#333"
          transform={`rotate(${hourHandRotation} 50 50)`}
        />

        {/* Minute Hand (longer, thinner) */}
        <rect
          x="49.5"
          y="20"
          width="1"
          height="30"
          rx="0.5"
          fill="#333"
          transform={`rotate(${minuteHandRotation} 50 50)`}
        />

        {/* Second Hand (longest, thinnest, red) */}
        <rect
          x="49.75"
          y="12"
          width="0.5"
          height="38"
          rx="0.25"
          fill="#d00"
          transform={`rotate(${secondHandRotation} 50 50)`}
        />

        {/* Center Pin */}
        <circle cx="50" cy="50" r="2" fill="#333" />
      </svg>
    </div>
  );
};


const TimerScreen: React.FC<TimerScreenProps> = ({ timeRemaining, totalTime, onPause, onDone, taskText, startTime, endTime }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const getTimerColor = () => {
    if (timeRemaining > 20 * 60) return 'text-green-500';
    if (timeRemaining > 10 * 60) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const handlePauseClick = () => {
    playClickSound();
    onPause();
  };

  const handleDoneClick = () => {
    playDoneSound();
    onDone();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <WallClock startTime={startTime} endTime={endTime} />
      <div className={`text-7xl font-mono font-bold mt-4 transition-colors duration-500 ${getTimerColor()}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex gap-4 mt-8">
        <button onClick={handlePauseClick} className="px-8 py-3 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition-colors">
          Pause
        </button>
        <button onClick={handleDoneClick} className="px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors">
          Done
        </button>
      </div>
      <div className="mt-6 text-center max-w-md px-4">
        <p className="text-gray-500 text-sm uppercase tracking-wider">Current Task</p>
        <p className="text-gray-700 text-lg font-serif italic break-words">{taskText}</p>
      </div>
    </div>
  );
};

export default TimerScreen;