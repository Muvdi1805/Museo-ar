import {
  angularDelta,
  normalizeAngle,
  OFFSCREEN,
  projectToViewport,
  Viewport,
} from "@/src/features/ar-museum/domain/services/spatialProjection";

const viewport: Viewport = { width: 400, height: 800, horizontalFov: 60 };
const at = (yaw: number, pitch = 0, distance = 2) => ({ yaw, pitch, distance });

describe("normalizeAngle", () => {
  it.each([
    [0, 0],
    [190, -170],
    [-190, 170],
    [360, 0],
    [540, 180],
    [-180, 180],
  ])("wraps %p° to %p°", (input, expected) => {
    expect(normalizeAngle(input)).toBeCloseTo(expected);
  });
});

describe("angularDelta", () => {
  it("takes the short way around 0°", () => {
    expect(angularDelta(10, 350)).toBeCloseTo(20);
    expect(angularDelta(350, 10)).toBeCloseTo(-20);
  });
});

describe("projectToViewport", () => {
  it("puts an artwork straight ahead at the center of the screen, focused", () => {
    const p = projectToViewport(at(0), { yaw: 0, pitch: 0 }, viewport);
    expect(p).toMatchObject({ visible: true, x: 200, y: 400, focused: true, opacity: 1, scale: 1 });
  });

  it("moves the artwork left when the user turns right", () => {
    const p = projectToViewport(at(0), { yaw: 20, pitch: 0 }, viewport);
    expect(p.visible).toBe(true);
    expect(p.x).toBeLessThan(200);
    expect(p.focused).toBe(false);
  });

  it("places an artwork at the edge of the field of view at the screen border", () => {
    const p = projectToViewport(at(30), { yaw: 0, pitch: 0 }, viewport);
    expect(p.x).toBeCloseTo(400);
  });

  it("moves the artwork down when the user looks up", () => {
    const p = projectToViewport(at(0, 0), { yaw: 0, pitch: 10 }, viewport);
    expect(p.y).toBeGreaterThan(400);
  });

  it("keeps working across the ±180° seam", () => {
    const p = projectToViewport(at(175), { yaw: -175, pitch: 0 }, viewport);
    expect(p.visible).toBe(true);
    expect(p.x).toBeLessThan(200); // the artwork is 10° to the left
  });

  it("hides artworks behind the user and parks them off screen", () => {
    const p = projectToViewport(at(180), { yaw: 0, pitch: 0 }, viewport);
    expect(p).toMatchObject({ visible: false, x: OFFSCREEN, y: OFFSCREEN, opacity: 0 });
  });

  it("hides artworks far outside the field of view", () => {
    expect(projectToViewport(at(70), { yaw: 0, pitch: 0 }, viewport).visible).toBe(false);
  });

  it("draws farther artworks smaller", () => {
    const near = projectToViewport(at(0, 0, 1), { yaw: 0, pitch: 0 }, viewport);
    const far = projectToViewport(at(0, 0, 4), { yaw: 0, pitch: 0 }, viewport);
    expect(near.scale).toBeGreaterThan(far.scale);
  });
});
