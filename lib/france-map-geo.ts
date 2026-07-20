// Shared metropolitan-France map geometry: the hand-traced outline, the
// equirectangular projection and the viewBox constants. Extracted from
// FranceHeatmap so every map surface (heatmap, political map) plots on the
// exact same canvas — two hand-traced outlines that drift apart is a bug
// waiting to happen.
//
// Client-safe: pure constants + pure functions, no data import.

export const LNG_MIN = -5.6;
export const LNG_MAX = 9.8;
export const LAT_MIN = 41.2;
export const LAT_MAX = 51.4;
export const PAD = 22;
export const MAP_W = 700;
export const MAP_H = 700;

const SCALE_X = (MAP_W - PAD * 2) / (LNG_MAX - LNG_MIN);
const SCALE_Y = (MAP_H - PAD * 2) / (LAT_MAX - LAT_MIN);

export function project(lng: number, lat: number): [number, number] {
  return [PAD + (lng - LNG_MIN) * SCALE_X, PAD + (LAT_MAX - lat) * SCALE_Y];
}

// A city outside this box (i.e. the DROM) would plot off-canvas.
export function inMetropolitanBox(lng: number, lat: number): boolean {
  return lng >= -6 && lng <= 10 && lat >= 40 && lat <= 52;
}

// Hand-traced French border (lng, lat) — closed polygon
export const BORDER: Array<[number, number]> = [
  [2.38, 51.04], [1.85, 50.95], [1.6, 50.7], [0.7, 50.0], [0.07, 49.51],
  [-1.0, 49.4], [-1.62, 49.64], [-1.95, 49.72], [-2.0, 49.0], [-3.0, 48.83],
  [-4.49, 48.39], [-4.7, 48.1], [-4.55, 47.85], [-4.10, 48.0], [-3.36, 47.74],
  [-2.6, 47.5], [-2.33, 47.22], [-1.85, 46.7], [-1.55, 46.5], [-1.15, 46.16],
  [-1.03, 45.62], [-1.16, 44.66], [-1.4, 44.2], [-1.47, 43.49], [-1.78, 43.36],
  [-0.7, 43.0], [0.5, 42.85], [1.7, 42.6], [2.89, 42.69], [3.17, 42.44],
  [3.6, 43.3], [4.6, 43.4], [5.37, 43.30], [5.93, 43.12], [6.6, 43.18],
  [7.27, 43.71], [7.50, 43.78], [7.0, 44.2], [6.85, 44.85], [6.95, 45.5],
  [7.05, 45.92], [6.85, 46.13], [6.14, 46.21], [6.1, 46.5], [6.45, 47.0],
  [6.95, 47.5], [7.34, 47.75], [7.55, 48.1], [7.75, 48.58], [8.0, 48.95],
  [8.18, 48.97], [7.5, 49.05], [6.95, 49.18], [6.5, 49.45], [6.0, 49.55],
  [5.5, 49.55], [4.85, 49.79], [4.85, 50.15], [4.2, 50.28], [3.7, 50.5],
  [3.06, 50.63], [2.6, 50.85], [2.38, 51.04],
];

// Hand-traced Corsica polygon (lng, lat)
export const CORSICA: Array<[number, number]> = [
  [9.45, 43.02], [9.56, 42.85], [9.55, 42.55], [9.52, 42.13],
  [9.40, 41.85], [9.28, 41.55], [9.17, 41.38], [9.05, 41.40],
  [8.79, 41.56], [8.65, 41.92], [8.55, 42.10], [8.65, 42.40],
  [8.55, 42.55], [8.85, 42.75], [9.10, 42.93], [9.25, 43.00],
  [9.45, 43.02],
];

export function buildPath(points: Array<[number, number]>): string {
  return (
    "M " +
    points
      .map(([lng, lat]) => {
        const [x, y] = project(lng, lat);
        return `${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" L ") +
    " Z"
  );
}

export const BORDER_PATH = buildPath(BORDER);
export const CORSICA_PATH = buildPath(CORSICA);
