import { ISpatialTracker } from "../services/ISpatialTracker";

// Makes the current pointing direction the new "front" (yaw 0). Useful after the sensors drift.
export class RecalibrateSpatialTrackerUseCase {
  constructor(private readonly tracker: ISpatialTracker) {}

  execute(): void {
    this.tracker.recalibrate();
  }
}
