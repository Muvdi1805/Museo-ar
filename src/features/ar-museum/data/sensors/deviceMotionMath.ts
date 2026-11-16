// Converts DeviceMotion's Euler angles (W3C convention: Z-X'-Y'', radians) into where the BACK CAMERA points.
//
// Reading `alpha` directly as the heading breaks when the phone is held upright (beta ≈ 90°): that is the
// gimbal-lock pose of these Euler angles, exactly how a phone is held for AR. Instead we build the rotation
// matrix and take the camera axis (device -Z) in world coordinates, which is stable in that pose.

export type CameraAngles = { yaw: number; pitch: number; roll: number };

const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function cameraAnglesFromEuler(alpha: number, beta: number, gamma: number): CameraAngles {
  const cZ = Math.cos(alpha), sZ = Math.sin(alpha);
  const cX = Math.cos(beta), sX = Math.sin(beta);
  const cY = Math.cos(gamma), sY = Math.sin(gamma);

  // Columns of R = Rz(alpha) · Rx(beta) · Ry(gamma): device axes expressed in world axes (x east, y north, z up).
  const rightZ = -cX * sY; // device +X (right edge of the screen), z component
  const upZ = sX; // device +Y (top edge of the screen), z component
  // Camera axis = device -Z.
  const camX = -(cZ * sY + sZ * sX * cY);
  const camY = -(sZ * sY - cZ * sX * cY);
  const camZ = -(cX * cY);

  return {
    // Clockwise from the world reference, so turning right increases yaw.
    yaw: toDeg(Math.atan2(camX, camY)),
    pitch: toDeg(Math.asin(Math.max(-1, Math.min(1, camZ)))),
    // Positive when the top of the phone leans to the right.
    roll: toDeg(Math.atan2(-rightZ, upZ)),
  };
}
