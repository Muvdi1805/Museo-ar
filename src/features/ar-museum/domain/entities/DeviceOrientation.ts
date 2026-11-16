// Where the back camera is pointing, in degrees, relative to the calibrated "front".
export type DeviceOrientation = {
  /** Heading, clockwise from front, in (-180, 180]. */
  yaw: number;
  /** Elevation of the camera axis, positive when pointing up, in [-90, 90]. */
  pitch: number;
  /** Screen tilt around the camera axis, positive when the top of the phone leans right. */
  roll: number;
  timestamp: number;
};
