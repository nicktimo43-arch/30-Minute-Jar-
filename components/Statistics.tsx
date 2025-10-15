
import React from 'react';
import type { Task } from '../types';

interface StatisticsProps {
  tasks: Task[];
}

const Statistics: React.FC<StatisticsProps> = ({ tasks }) => {
  const inputCount = tasks.filter(task => task.type === 'input').length;
  const outputCount = tasks.filter(task => task.type === 'output').length;
  const totalCount = tasks.length;

  return (
    <div className="absolute top-4 left-4 md:top-8 md:left-8 text-left text-gray-600 font-mono text-sm">
      <p>Total Tasks Completed: {totalCount}</p>
      <p>Inputs: {inputCount}</p>
      <p>Outputs: {outputCount}</p>
    </div>
  );
};

export default Statistics;
