import React from 'react';
import { PlantStyle } from '../types';

interface PixelPlantProps {
  growth: number; // Number of completed tasks
  plantStyle: PlantStyle;
}

const MAX_GROWTH = 84;
const PIXEL_SIZE = 4; // The size of each "pixel" in SVG units

const Pixel: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <rect
    x={x * PIXEL_SIZE}
    y={y * PIXEL_SIZE}
    width={PIXEL_SIZE}
    height={PIXEL_SIZE}
    fill="black"
  />
);

const PixelShape: React.FC<{ x: number; y: number; shape: number[][]; mirrored?: boolean }> = ({ x, y, shape, mirrored = false }) => {
  const width = shape[0].length;
  return (
    <g>
      {shape.map((row, rIdx) =>
        row.map((pixel, pIdx) => {
          if (pixel === 1) {
            const finalPIdx = mirrored ? width - 1 - pIdx : pIdx;
            return <Pixel key={`${rIdx}-${pIdx}`} x={x + finalPIdx} y={y + rIdx} />;
          }
          return null;
        })
      )}
    </g>
  );
};

const PixelPlant: React.FC<PixelPlantProps> = ({ growth, plantStyle }) => {
  const clampedGrowth = Math.min(growth, MAX_GROWTH);

  // --- Calculations ---
  const stemHeight = Math.floor(clampedGrowth * 0.9); // Stem grows for most of the duration
  const leafCount = Math.floor(clampedGrowth / 6); // A new pair of leaves every 6 tasks
  const showFlower = clampedGrowth >= MAX_GROWTH - 5; // Flower appears near the end

  const { leafShape, flowerShape } = plantStyle;

  const leafHeight = leafShape.length;
  const leafWidth = leafShape[0].length;

  const flowerHeight = flowerShape.length;
  const flowerWidth = flowerShape[0].length;
  
  const totalHeight = 80;
  const potHeight = 10;
  const groundLevel = totalHeight - potHeight;
  const stemBaseX = 9;

  return (
    <div className="flex-shrink-0" aria-label={`A pixel plant with ${growth} tasks of growth.`}>
      <svg
        width={80}
        height={320}
        viewBox={`0 0 20 ${totalHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="w-20 h-auto"
      >
        {/* Pot */}
        <Pixel x={stemBaseX - 3} y={groundLevel} />
        <Pixel x={stemBaseX - 2} y={groundLevel} />
        <Pixel x={stemBaseX - 1} y={groundLevel} />
        <Pixel x={stemBaseX} y={groundLevel} />
        <Pixel x={stemBaseX + 1} y={groundLevel} />
        <Pixel x={stemBaseX + 2} y={groundLevel} />
        <Pixel x={stemBaseX + 3} y={groundLevel} />
        
        <Pixel x={stemBaseX - 2} y={groundLevel + 1} />
        <Pixel x={stemBaseX - 1} y={groundLevel + 1} />
        <Pixel x={stemBaseX} y={groundLevel + 1} />
        <Pixel x={stemBaseX + 1} y={groundLevel + 1} />
        <Pixel x={stemBaseX + 2} y={groundLevel + 1} />

        {/* Stem */}
        {Array.from({ length: stemHeight }).map((_, i) => (
          <Pixel key={`stem-${i}`} x={stemBaseX} y={groundLevel - 1 - i} />
        ))}
        
        {/* Leaves */}
        {Array.from({ length: leafCount }).map((_, i) => {
           if (stemHeight < 10 + i * 5) return null; // Don't draw leaves if stem isn't tall enough
           const yPos = groundLevel - 10 - (i * 5);
           const isMirrored = i % 2 !== 0;
           const xPos = isMirrored ? stemBaseX + 1 : stemBaseX - leafWidth;

           return (
             <PixelShape
                key={`leaf-${i}`}
                x={xPos}
                y={yPos - Math.floor(leafHeight / 2)}
                shape={leafShape}
                mirrored={isMirrored}
             />
           )
        })}

        {/* Flower */}
        {showFlower && stemHeight > flowerHeight && (
             <PixelShape
                x={stemBaseX - Math.floor(flowerWidth / 2)}
                y={groundLevel - stemHeight - 1}
                shape={flowerShape}
             />
        )}

      </svg>
    </div>
  );
};

export default PixelPlant;
