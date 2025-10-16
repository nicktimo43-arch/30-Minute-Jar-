import React from 'react';
import { PlantStyle } from '../types';

interface PixelPlantProps {
  growth: number;
  plantStyle: PlantStyle;
}

const PIXEL_SIZE = 2;
const MAX_GROWTH = 84;

const PixelPlant: React.FC<PixelPlantProps> = ({ growth, plantStyle }) => {
  const effectiveGrowth = Math.min(growth, MAX_GROWTH);
  
  const plantPixels: React.ReactElement[] = [];

  const MAX_STEM_HEIGHT_PIXELS = 30;
  const stemHeight = Math.ceil((effectiveGrowth / MAX_GROWTH) * MAX_STEM_HEIGHT_PIXELS);
  const stemX = 49;
  
  // 1. Draw Stem
  for (let i = 0; i < stemHeight; i++) {
    plantPixels.push(<rect key={`stem-${i}`} x={stemX} y={93 - i * PIXEL_SIZE} width={PIXEL_SIZE} height={PIXEL_SIZE} fill="black" />);
  }

  // 2. Draw Leaves
  const numLeaves = Math.floor(effectiveGrowth / 7); // A new leaf pair roughly every 7 tasks
  const { leafShape } = plantStyle;
  if (leafShape && leafShape.length > 0 && leafShape[0].length > 0) {
      for (let i = 0; i < numLeaves; i++) {
          const leafY = 88 - (i * 4 * PIXEL_SIZE);
          const flip = i % 2 !== 0;
          const leafX = flip ? stemX - (leafShape[0].length * PIXEL_SIZE) : stemX + PIXEL_SIZE;
          
          if (leafY < 10) continue; // Prevent leaves from growing off the top

          leafShape.forEach((row, y) => {
              row.forEach((pixel, x) => {
                  if (pixel) {
                      const finalX = leafX + (flip ? (leafShape[0].length - 1 - x) : x) * PIXEL_SIZE;
                      plantPixels.push(<rect key={`leaf-${i}-${y}-${x}`} x={finalX} y={leafY + y * PIXEL_SIZE} width={PIXEL_SIZE} height={PIXEL_SIZE} fill="black" />);
                  }
              });
          });
      }
  }


  // 3. Draw Flower
  const { flowerShape } = plantStyle;
  if (effectiveGrowth >= MAX_GROWTH && flowerShape) {
    const flowerY = 93 - stemHeight * PIXEL_SIZE - (flowerShape.length * PIXEL_SIZE);
    const flowerX = stemX - Math.floor(flowerShape[0].length / 2) * PIXEL_SIZE;
    flowerShape.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel) {
          plantPixels.push(<rect key={`flower-${y}-${x}`} x={flowerX + x * PIXEL_SIZE} y={flowerY + y * PIXEL_SIZE} width={PIXEL_SIZE} height={PIXEL_SIZE} fill="black" />);
        }
      });
    });
  } else if (stemHeight > 1) { // Bud
     const budY = 93 - (stemHeight - 1) * PIXEL_SIZE;
     plantPixels.push(<rect key="bud" x={stemX - PIXEL_SIZE} y={budY} width={PIXEL_SIZE*2} height={PIXEL_SIZE} fill="black" />);
     plantPixels.push(<rect key="bud2" x={stemX} y={budY - PIXEL_SIZE} width={PIXEL_SIZE} height={PIXEL_SIZE} fill="black" />);

  }


  return (
    <svg viewBox="0 0 100 120" width="120" height="144" aria-label={`A line art pot with a pixelated plant. Growth level is ${growth}.`}>
      {/* Plant */}
      <g>{plantPixels}</g>

      {/* Pot */}
      <g stroke="black" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Main pot body path for filling - hides the stem inside */}
        <path d="M25,118 C15,118 15,95 28,95 A 22,8 0 0 0 72,95 C85,95 85,118 75,118 Z" fill="white" />

        {/* Pot Outline */}
        <path d="M25,118 L75,118" /> {/* Bottom */}
        <path d="M25,118 C15,118 15,95 28,95" /> {/* Left Side */}
        <path d="M75,118 C85,118 85,95 72,95" /> {/* Right Side */}
        <path d="M28,95 A 22,8 0 0 0 72,95" /> {/* Front Rim */}
      </g>
    </svg>
  );
};

export default PixelPlant;