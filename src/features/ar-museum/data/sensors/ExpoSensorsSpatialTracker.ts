import { DeviceMotion, DeviceMotionMeasurement } from "expo-sensors";

import { DeviceOrientation } from "../../domain/entities/DeviceOrientation";
import { ISpatialTracker, OrientationListener } from "../../domain/services/ISpatialTracker";
import { angularDelta, normalizeAngle } from "../../domain/services/spatialProjection";
import { cameraAnglesFromEuler } from "./deviceMotionMath";

// The subset of expo-sensors' DeviceMotion this adapter needs (lets tests pass a fake sensor).
export type MotionSensor = {
  isAvailableAsync(): Promise<boolean>;
  setUpdateInterval(intervalMs: number): void;
  addListener(listener: (measurement: DeviceMotionMeasurement) => void): { remove(): void };
};

const UPDATE_INTERVAL_MS = 16; // ~60 Hz
/** Low-pass filter weight of each new reading (0..1). Lower = smoother but laggier. */
const SMOOTHING = 0.3;

// ISpatialTracker backed by DeviceMotion (sensor fusion of gyroscope + accelerometer + magnetometer).
// The first reading becomes the "front" (yaw 0), so artworks are placed relative to where the demo starts.
export class ExpoSensorsSpatialTracker implements ISpatialTracker {
  private readonly listeners = new Set<OrientationListener>();
  private subscription: { remove(): void } | null = null;
  private current: DeviceOrientation | null = null;
  private yawOffset = 0;
  private needsCalibration = true;

  constructor(private readonly sensor: MotionSensor = DeviceMotion) {}

  async isAvailable(): Promise<boolean> {
    try {
      return await this.sensor.isAvailableAsync();
    } catch {
      return false;
    }
  }

  subscribe(listener: OrientationListener): () => void {
    this.listeners.add(listener);
    if (this.current) listener(this.current);
    if (!this.subscription) this.start();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  }

  getCurrentOrientation(): DeviceOrientation | null {
    return this.current;
  }

  recalibrate(): void {
    this.needsCalibration = true;
  }

  private start() {
    this.sensor.setUpdateInterval(UPDATE_INTERVAL_MS);
    this.subscription = this.sensor.addListener((m) => this.onMeasurement(m));
  }

  private stop() {
    this.subscription?.remove();
    this.subscription = null;
  }

  private onMeasurement(measurement: DeviceMotionMeasurement) {
    const rotation = measurement.rotation;
    if (!rotation) return;

    const raw = cameraAnglesFromEuler(rotation.alpha, rotation.beta, rotation.gamma);
    if (this.needsCalibration) {
      this.yawOffset = raw.yaw;
      this.needsCalibration = false;
      this.current = null; // restart the filter from the new reference
    }

    const target = { yaw: normalizeAngle(raw.yaw - this.yawOffset), pitch: raw.pitch, roll: raw.roll };
    const prev = this.current;
    this.current = prev
      ? {
          // Angle-aware smoothing so crossing ±180° does not spin the view around.
          yaw: normalizeAngle(prev.yaw + angularDelta(target.yaw, prev.yaw) * SMOOTHING),
          pitch: prev.pitch + (target.pitch - prev.pitch) * SMOOTHING,
          roll: normalizeAngle(prev.roll + angularDelta(target.roll, prev.roll) * SMOOTHING),
          timestamp: Date.now(),
        }
      : { ...target, timestamp: Date.now() };

    const snapshot = this.current;
    this.listeners.forEach((l) => l(snapshot));
  }
}
