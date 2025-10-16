import { PlantStyle, PlantShape } from './types';

// A simple pseudo-random number generator for deterministic results
const mulberry32 = (seed: number) => {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Simple string hashing to create a seed
const createSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// --- Shape Libraries ---

const LEAF_SHAPES: PlantShape[] = [
  // Simple Oval
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  // Pointy
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0]
  ],
  // Three-pronged
  [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1]
  ],
  // Heart Shape
  [
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 0]
  ],
  // Arrow
  [
    [0, 1, 0],
    [1, 1, 1],
    [1, 0, 1]
  ]
];

const FLOWER_SHAPES: PlantShape[] = [
  // Simple 5-petal
  [
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0]
  ],
  // Tulip
  [
    [1, 0, 1],
    [1, 1, 1],
    [1, 1, 1],
    [0, 1, 0]
  ],
  // Rose Bud
  [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0]
  ],
  // Sunflower
  [
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1]
  ],
  // Daisy
  [
      [1, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1]
  ]
];

export const generatePlantStyle = (weekSeed: string): PlantStyle => {
  const seed = createSeed(weekSeed);
  const random = mulberry32(seed);

  const leafIndex = Math.floor(random() * LEAF_SHAPES.length);
  const flowerIndex = Math.floor(random() * FLOWER_SHAPES.length);

  return {
    leafShape: LEAF_SHAPES[leafIndex],
    flowerShape: FLOWER_SHAPES[flowerIndex]
  };
};
