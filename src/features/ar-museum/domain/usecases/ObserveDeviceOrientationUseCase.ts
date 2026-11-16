import { ISpatialTracker, OrientationListener } from "../services/ISpatialTracker";

// Lets the UI follow where the device points without knowing which sensors are used.
export class ObserveDeviceOrientationUseCase {
  constructor(private readonly tracker: ISpatialTracker) {}

  isAvailable(): Promise<boolean> {
    return this.tracker.isAvailable();
  }

  /** Returns a function that stops the updates. */
  execute(listener: OrientationListener): () => void {
    return this.tracker.subscribe(listener);
  }
}
