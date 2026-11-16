import { DeviceMotionMeasurement } from "expo-sensors";

import { cameraAnglesFromEuler } from "@/src/features/ar-museum/data/sensors/deviceMotionMath";
import { ExpoSensorsSpatialTracker, MotionSensor } from "@/src/features/ar-museum/data/sensors/ExpoSensorsSpatialTracker";

const rad = (deg: number) => (deg * Math.PI) / 180;

describe("cameraAnglesFromEuler", () => {
  it("phone upright facing the reference: yaw 0, pitch 0, roll 0", () => {
    const a = cameraAnglesFromEuler(0, rad(90), 0);
    expect(a.yaw).toBeCloseTo(0);
    expect(a.pitch).toBeCloseTo(0);
    expect(a.roll).toBeCloseTo(0);
  });

  it("turning right (alpha decreasing) increases yaw", () => {
    expect(cameraAnglesFromEuler(rad(-90), rad(90), 0).yaw).toBeCloseTo(90);
    expect(cameraAnglesFromEuler(rad(30), rad(90), 0).yaw).toBeCloseTo(-30);
  });

  it("tilting the top backwards points the camera up", () => {
    expect(cameraAnglesFromEuler(0, rad(120), 0).pitch).toBeCloseTo(30);
  });

  it("phone flat on a table points the camera at the floor", () => {
    expect(cameraAnglesFromEuler(0, 0, 0).pitch).toBeCloseTo(-90);
  });
});

// Fake DeviceMotion that lets the test push readings.
function fakeSensor() {
  let listener: ((m: DeviceMotionMeasurement) => void) | null = null;
  const remove = jest.fn(() => {
    listener = null;
  });
  const sensor: MotionSensor = {
    isAvailableAsync: jest.fn().mockResolvedValue(true),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn((l) => {
      listener = l;
      return { remove };
    }),
  };
  // Heading in degrees (positive = turned right), phone held upright.
  const push = (yawDeg: number) =>
    listener?.({ rotation: { alpha: rad(-yawDeg), beta: rad(90), gamma: 0, timestamp: 0 } } as DeviceMotionMeasurement);
  return { sensor, push, remove };
}

describe("ExpoSensorsSpatialTracker", () => {
  it("only listens to the sensor while someone is subscribed", () => {
    const { sensor, remove } = fakeSensor();
    const tracker = new ExpoSensorsSpatialTracker(sensor);

    const stopA = tracker.subscribe(jest.fn());
    const stopB = tracker.subscribe(jest.fn());
    expect(sensor.addListener).toHaveBeenCalledTimes(1);

    stopA();
    expect(remove).not.toHaveBeenCalled();
    stopB();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("uses the first reading as the front (yaw 0)", () => {
    const { sensor, push } = fakeSensor();
    const tracker = new ExpoSensorsSpatialTracker(sensor);
    tracker.subscribe(jest.fn());

    push(70);
    expect(tracker.getCurrentOrientation()?.yaw).toBeCloseTo(0);
  });

  it("smooths readings and converges to the new heading", () => {
    const { sensor, push } = fakeSensor();
    const tracker = new ExpoSensorsSpatialTracker(sensor);
    const listener = jest.fn();
    tracker.subscribe(listener);

    push(0);
    push(40);
    const first = tracker.getCurrentOrientation()!.yaw;
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(40);

    for (let i = 0; i < 40; i++) push(40);
    expect(tracker.getCurrentOrientation()!.yaw).toBeCloseTo(40, 1);
    expect(listener).toHaveBeenCalled();
  });

  it("crosses ±180° the short way", () => {
    const { sensor, push } = fakeSensor();
    const tracker = new ExpoSensorsSpatialTracker(sensor);
    tracker.subscribe(jest.fn());

    push(0);
    for (let i = 0; i < 40; i++) push(175);
    push(-175); // 10° further to the right, not 350° back
    const yaw = tracker.getCurrentOrientation()!.yaw;
    expect(Math.abs(yaw)).toBeGreaterThan(175);
  });

  it("recalibrate makes the current direction the new front", () => {
    const { sensor, push } = fakeSensor();
    const tracker = new ExpoSensorsSpatialTracker(sensor);
    tracker.subscribe(jest.fn());

    push(0);
    for (let i = 0; i < 40; i++) push(90);
    tracker.recalibrate();
    push(90);
    expect(tracker.getCurrentOrientation()?.yaw).toBeCloseTo(0);
  });

  it("reports unavailable when the sensor check throws", async () => {
    const { sensor } = fakeSensor();
    (sensor.isAvailableAsync as jest.Mock).mockRejectedValue(new Error("no sensor"));
    expect(await new ExpoSensorsSpatialTracker(sensor).isAvailable()).toBe(false);
  });
});
