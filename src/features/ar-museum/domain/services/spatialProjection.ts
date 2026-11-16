// Pure math that turns angular positions into screen coordinates (pinhole camera model).
//
// About the "worklet" lines: they are plain string literals, not imports, so this file stays framework-free.
// Reanimated's Babel plugin uses them to also run these same functions on the UI thread at 60 fps;
// everywhere else (tests, use cases) they are ignored.

import { SpatialPosition } from "../entities/Artwork";

export type ViewDirection = { yaw: number; pitch: number };

export type Viewport = {
  width: number;
  height: number;
  /** Horizontal field of view of the camera preview, in degrees. */
  horizontalFov: number;
};

export type Projection = {
  visible: boolean;
  /** Screen position of the artwork's center, in px. */
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** True when the artwork sits under the central crosshair. */
  focused: boolean;
};

/** Distance (m) at which an artwork is drawn at scale 1. */
export const REFERENCE_DISTANCE = 2;
/** Where hidden artworks are parked so they cannot be touched. */
export const OFFSCREEN = -10000;
/** Extra px around the screen in which artworks keep being drawn (so they slide in smoothly). */
const SCREEN_MARGIN = 220;
const FOCUS_RADIUS = 70;

const toRad = (deg: number) => {
  "worklet";
  return (deg * Math.PI) / 180;
};

export function clamp(value: number, min: number, max: number): number {
  "worklet";
  return Math.min(max, Math.max(min, value));
}

/** Wraps any angle in degrees to (-180, 180]. */
export function normalizeAngle(deg: number): number {
  "worklet";
  const wrapped = (((deg + 180) % 360) + 360) % 360 - 180;
  return wrapped === -180 ? 180 : wrapped;
}

/** Shortest signed rotation from `from` to `to`, in degrees (e.g. 350° → 10° is +20°). */
export function angularDelta(to: number, from: number): number {
  "worklet";
  return normalizeAngle(to - from);
}

export function projectToViewport(
  position: SpatialPosition,
  view: ViewDirection,
  viewport: Viewport,
): Projection {
  "worklet";
  const hidden: Projection = { visible: false, x: OFFSCREEN, y: OFFSCREEN, scale: 0, opacity: 0, focused: false };

  const dYaw = angularDelta(position.yaw, view.yaw);
  const dPitch = position.pitch - view.pitch;
  // Behind the user (or straight above/below): not projectable onto the screen plane.
  if (Math.abs(dYaw) >= 90 || Math.abs(dPitch) >= 90) return hidden;

  const halfW = viewport.width / 2;
  const halfH = viewport.height / 2;
  const focal = halfW / Math.tan(toRad(viewport.horizontalFov / 2));

  const x = halfW + focal * Math.tan(toRad(dYaw));
  const y = halfH - focal * Math.tan(toRad(dPitch));

  const onScreen =
    x > -SCREEN_MARGIN &&
    x < viewport.width + SCREEN_MARGIN &&
    y > -SCREEN_MARGIN &&
    y < viewport.height + SCREEN_MARGIN;
  if (!onScreen) return hidden;

  const scale = clamp(REFERENCE_DISTANCE / Math.max(position.distance, 0.1), 0.4, 2.5);
  // Fully opaque in the middle of the view, fading towards the edges.
  const edgeRatio = Math.max(Math.abs(x - halfW) / halfW, Math.abs(y - halfH) / halfH);
  const opacity = clamp(1.6 - 0.6 * edgeRatio, 0, 1);
  const focused = Math.abs(x - halfW) < FOCUS_RADIUS && Math.abs(y - halfH) < FOCUS_RADIUS;

  return { visible: true, x, y, scale, opacity, focused };
}
