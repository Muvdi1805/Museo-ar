import { DeviceOrientation } from "../entities/DeviceOrientation";

export type OrientationListener = (orientation: DeviceOrientation) => void;

// Tracks where the device is pointing. Implementations decide which sensors to use.
export interface ISpatialTracker {
  isAvailable(): Promise<boolean>;
  /** Starts receiving orientation updates. Returns a function that stops them. */
  subscribe(listener: OrientationListener): () => void;
  /** Last known orientation, or null if no reading has arrived yet. */
  getCurrentOrientation(): DeviceOrientation | null;
  /** Makes the direction the device points to right now the new "front" (yaw 0). */
  recalibrate(): void;
}
