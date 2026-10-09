import type { StylePresetId } from '../types/panorama';
import { healPanoramaSeam } from './seamHealer';

export interface ProceduralPresetData {
  id: StylePresetId;
  title: string;
  description: string;
  prompt: string;
}

export const PRESET_PANORAMAS: ProceduralPresetData[] = [
  {
    id: 'cyberpunk',
    title: 'Cyberpunk Neon Metropolis',
    description: '360° panoramic view of futuristic neon megacity with rain-slicked highway and glowing skyscrapers',
    prompt: 'futuristic cyberpunk city at night, neon holograms, rain reflections, volumetric fog, 8k equirectangular 360 panorama',
  },
  {
    id: 'nature',
    title: 'Tropical Sunset Coast',
    description: 'Golden hour sunset over calm ocean waters with coconut palms and distant mountain silhouettes',
    prompt: 'tropical island sunset, golden reflections on ocean waves, palm trees, purple clouds, 8k equirectangular 360 panorama',
  },
  {
    id: 'space',
    title: 'Cosmic Stellar Nebula',
    description: 'Deep space cosmic panorama with luminous gas clouds, star clusters, and celestial planets',
    prompt: 'deep space nebula, purple and teal cosmic dust, glowing galaxies, distant ringed planet, 8k 360 equirectangular skybox',
  },
  {
    id: 'interior',
    title: 'Minimalist Architecture Penthouse',
    description: 'Modern luxury loft interior with panoramic glass curtain wall and warm oak wood flooring',
    prompt: 'luxury modern penthouse interior, floor-to-ceiling glass windows, evening city view, warm architectural lighting, 8k equirectangular 360',
  },
  {
    id: 'fantasy',
    title: 'Ancient Celestial Temple',
    description: 'Mystical stone ruins atop floating islands beneath an ethereal aurora borealis sky',
    prompt: 'ancient fantasy temple ruins, floating celestial stones, glowing magical runes, aurora sky, 8k equirectangular 360 panorama',
  },
];

/**
 * Procedurally draws a rich, seamless 2:1 equirectangular panorama on a canvas.
 */
export function generateProceduralPanorama(
  style: StylePresetId,
  promptText: string,
  width = 2048,
  height = 1024
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Render based on chosen style
  switch (style) {
    case 'cyberpunk':
      drawCyberpunkScene(ctx, width, height, promptText);
      break;
    case 'nature':
      drawNatureSunsetScene(ctx, width, height);
      break;
    case 'space':
      drawSpaceNebulaScene(ctx, width, height);
      break;
    case 'interior':
      drawInteriorScene(ctx, width, height);
      break;
    case 'anime':
      drawNatureSunsetScene(ctx, width, height);
      break;
    case 'fantasy':
    default:
      drawFantasyTempleScene(ctx, width, height);
      break;
  }

  // Apply benchmark seam-healing algorithm so the 360 wrapping has zero visible cut
  return healPanoramaSeam(canvas, 140);
}

function drawCyberpunkScene(ctx: CanvasRenderingContext2D, w: number, h: number, _prompt: string): void {
  // Dark sky gradient with neon hue
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  skyGrad.addColorStop(0, '#05020c');
  skyGrad.addColorStop(0.5, '#120b29');
  skyGrad.addColorStop(1, '#2a0e4a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.6);

  // Wet reflective ground
  const groundGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
  groundGrad.addColorStop(0, '#100b1a');
  groundGrad.addColorStop(0.3, '#090510');
  groundGrad.addColorStop(1, '#020106');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);

  // Background neon fog glow on horizon
  const horizonGlow = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.65);
  horizonGlow.addColorStop(0, 'rgba(236, 72, 153, 0)');
  horizonGlow.addColorStop(0.5, 'rgba(236, 72, 153, 0.4)');
  horizonGlow.addColorStop(1, 'rgba(6, 182, 212, 0.3)');
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, h * 0.5, w, h * 0.15);

  // Distant skyscrapers (repeating across 360 span seamlessly)
  const numBuildings = 48;
  const buildingWidth = w / numBuildings;

  for (let i = 0; i < numBuildings; i++) {
    const x = i * buildingWidth;
    const theta = (i / numBuildings) * Math.PI * 2;
    const bHeight = 150 + Math.sin(theta * 3) * 65 + Math.cos(theta * 5) * 35;
    const y = h * 0.6 - bHeight;

    // Building body
    ctx.fillStyle = i % 2 === 0 ? '#0c071b' : '#140c2d';
    ctx.fillRect(x, y, buildingWidth + 1, bHeight);

    // Neon edge lights
    ctx.strokeStyle = i % 3 === 0 ? '#06b6d4' : '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + buildingWidth, y);
    ctx.stroke();

    // Windows pattern
    ctx.fillStyle = i % 4 === 0 ? 'rgba(6, 182, 212, 0.8)' : 'rgba(250, 204, 21, 0.6)';
    for (let wy = y + 15; wy < h * 0.6 - 15; wy += 22) {
      for (let wx = x + 6; wx < x + buildingWidth - 6; wx += 14) {
        if ((wx + wy) % 3 !== 0) {
          ctx.fillRect(wx, wy, 6, 8);
        }
      }
    }

    // Ground wet reflection
    const reflHeight = bHeight * 0.4;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(6, 182, 212, 0.12)' : 'rgba(236, 72, 153, 0.1)';
    ctx.fillRect(x + 4, h * 0.6, buildingWidth - 8, reflHeight);
  }

  // Futuristic overhead neon grid lines / flying vehicle streaks
  for (let s = 0; s < 12; s++) {
    const sy = 80 + s * 30;
    ctx.strokeStyle = s % 2 === 0 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(w, sy);
    ctx.stroke();
  }
}

function drawNatureSunsetScene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Sunset sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  sky.addColorStop(0, '#1e1b4b');
  sky.addColorStop(0.3, '#6b21a8');
  sky.addColorStop(0.6, '#ea580c');
  sky.addColorStop(0.85, '#f59e0b');
  sky.addColorStop(1, '#fef08a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.55);

  // Glowing Sun at center (longitude 0 / 180)
  const sunX = w * 0.5;
  const sunY = h * 0.52;
  const sunRadius = 60;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 200);
  sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  sunGlow.addColorStop(0.3, 'rgba(254, 240, 138, 0.9)');
  sunGlow.addColorStop(0.7, 'rgba(249, 115, 22, 0.4)');
  sunGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  // Ocean Water with sunset reflections
  const sea = ctx.createLinearGradient(0, h * 0.55, 0, h);
  sea.addColorStop(0, '#c2410c');
  sea.addColorStop(0.2, '#9a3412');
  sea.addColorStop(0.6, '#1e3a8a');
  sea.addColorStop(1, '#0f172a');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  // Golden shimmer corridor under the sun
  const shimmer = ctx.createLinearGradient(sunX - 180, 0, sunX + 180, 0);
  shimmer.addColorStop(0, 'rgba(254, 240, 138, 0)');
  shimmer.addColorStop(0.5, 'rgba(254, 240, 138, 0.6)');
  shimmer.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = shimmer;
  for (let wy = h * 0.55; wy < h; wy += 8) {
    const waveW = (wy - h * 0.55) * 1.2;
    ctx.fillRect(sunX - waveW / 2, wy, waveW, 3);
  }

  // Mountain & palm silhouettes on the sides
  ctx.fillStyle = '#090514';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.55);
  ctx.lineTo(w * 0.25, h * 0.42);
  ctx.lineTo(w * 0.4, h * 0.55);
  ctx.lineTo(0, h * 0.55);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w * 0.6, h * 0.55);
  ctx.lineTo(w * 0.8, h * 0.45);
  ctx.lineTo(w, h * 0.55);
  ctx.lineTo(w * 0.6, h * 0.55);
  ctx.fill();
}

function drawSpaceNebulaScene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Deep space ground
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, w, h);

  // Swirling Cosmic Nebula Clouds
  const colors = [
    { x: w * 0.3, y: h * 0.4, r: 350, col: 'rgba(147, 51, 234, 0.4)' }, // Purple
    { x: w * 0.7, y: h * 0.6, r: 400, col: 'rgba(59, 130, 246, 0.35)' }, // Blue
    { x: w * 0.5, y: h * 0.3, r: 280, col: 'rgba(236, 72, 153, 0.35)' }, // Pink
    { x: w * 0.85, y: h * 0.45, r: 320, col: 'rgba(20, 184, 166, 0.3)' }, // Teal
  ];

  for (const c of colors) {
    const grad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.r);
    grad.addColorStop(0, c.col);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Giant ringed planet
  const planetX = w * 0.22;
  const planetY = h * 0.35;
  const planetR = 110;
  const pGrad = ctx.createRadialGradient(planetX - 30, planetY - 30, 10, planetX, planetY, planetR);
  pGrad.addColorStop(0, '#fde68a');
  pGrad.addColorStop(0.7, '#d97706');
  pGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
  ctx.fill();

  // Planet Ring
  ctx.save();
  ctx.translate(planetX, planetY);
  ctx.rotate(-0.4);
  ctx.scale(2.2, 0.4);
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.7)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(0, 0, planetR * 1.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Dense field of stars (equirectangular density compensation)
  for (let i = 0; i < 900; i++) {
    const sx = (Math.sin(i * 991.1) * 0.5 + 0.5) * w;
    const sy = (Math.cos(i * 323.7) * 0.5 + 0.5) * h;
    const size = (i % 9 === 0 ? 2.5 : 1.2) + Math.sin(i) * 0.5;
    const alpha = 0.4 + (i % 10) * 0.06;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(sx, sy, size, size);
  }
}

function drawInteriorScene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Ceiling
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, w, h * 0.3);

  // Modern floor with wooden parquet warm reflection
  const floor = ctx.createLinearGradient(0, h * 0.7, 0, h);
  floor.addColorStop(0, '#78350f');
  floor.addColorStop(0.5, '#451a03');
  floor.addColorStop(1, '#1c1917');
  ctx.fillStyle = floor;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);

  // Floor plank lines (32 repeating planks across 360 degrees)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 2;
  const numPlanks = 32;
  const plankStep = w / numPlanks;
  for (let i = 0; i < numPlanks; i++) {
    const x = i * plankStep;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.7);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Panoramic Glass Windows looking out onto skyline
  const skyWindow = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.7);
  skyWindow.addColorStop(0, '#030712');
  skyWindow.addColorStop(0.6, '#111827');
  skyWindow.addColorStop(1, '#1f2937');
  ctx.fillStyle = skyWindow;
  ctx.fillRect(0, h * 0.3, w, h * 0.4);

  // Window frame mullions (16 evenly spaced bars across 360 degrees)
  ctx.fillStyle = '#0f172a';
  const numMullions = 16;
  const mullionStep = w / numMullions;
  for (let i = 0; i < numMullions; i++) {
    const x = i * mullionStep;
    ctx.fillRect(x, h * 0.3, 14, h * 0.4);
  }

  // Recessed ambient ceiling lights (16 evenly spaced recessed spotlights)
  ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
  for (let i = 0; i < numMullions; i++) {
    const x = (i + 0.5) * mullionStep;
    ctx.beginPath();
    ctx.arc(x, h * 0.15, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFantasyTempleScene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Aurora Borealis Night Sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, '#020617');
  sky.addColorStop(0.4, '#064e3b');
  sky.addColorStop(0.7, '#047857');
  sky.addColorStop(1, '#10b981');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.6);

  // Aurora curtains (strictly periodic across 360 wrap)
  for (let a = 0; a < 4; a++) {
    const wave = ctx.createLinearGradient(0, 50, 0, h * 0.55);
    wave.addColorStop(0, 'rgba(16, 185, 129, 0)');
    wave.addColorStop(0.5, 'rgba(52, 211, 153, 0.4)');
    wave.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = wave;
    ctx.beginPath();
    ctx.moveTo(0, 100);
    const waveSteps = 64;
    for (let s = 0; s <= waveSteps; s++) {
      const x = (s / waveSteps) * w;
      const angle = (s / waveSteps) * Math.PI * 2 * 3; // 3 full sine waves
      const y = 140 + Math.sin(angle + a * 1.5) * 70;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.6);
    ctx.lineTo(0, h * 0.6);
    ctx.fill();
  }

  // Stone Platform & Ruins Ground
  const ground = ctx.createLinearGradient(0, h * 0.6, 0, h);
  ground.addColorStop(0, '#1c1917');
  ground.addColorStop(0.5, '#0c0a09');
  ground.addColorStop(1, '#000000');
  ctx.fillStyle = ground;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);

  // Ancient Monolith Pillars (periodic 16 pillars around the sphere)
  const numPillars = 16;
  for (let p = 0; p < numPillars; p++) {
    const px = (p * (w / numPillars)) + 30;
    const pAngle = (p / numPillars) * Math.PI * 2;
    const pHeight = 220 + Math.round(Math.sin(pAngle * 2) * 40 + Math.cos(pAngle * 4) * 20);
    const py = h * 0.6 - pHeight;

    ctx.fillStyle = '#292524';
    ctx.fillRect(px, py, 45, pHeight + 20);

    // Glowing Runes on pillars
    ctx.fillStyle = '#34d399';
    ctx.fillRect(px + 18, py + 40, 8, 30);
    ctx.fillRect(px + 14, py + 90, 16, 8);
    ctx.fillRect(px + 18, py + 120, 8, 25);
  }
}
