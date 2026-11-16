// Angular position of an artwork around the user, relative to the calibrated "front" (yaw 0).
// Angles are in degrees so they read naturally in the technical sheet.
export type SpatialPosition = {
  /** Horizontal angle, clockwise from front, in (-180, 180]. */
  yaw: number;
  /** Vertical angle, positive above the horizon, in [-90, 90]. */
  pitch: number;
  /** Virtual distance in meters: farther artworks are drawn smaller. */
  distance: number;
};

// Where the picture comes from: an image bundled with the app (samples) or a file on the device.
export type ArtworkImage = { kind: "bundled"; key: string } | { kind: "uri"; uri: string };

export type Artwork = {
  id: string;
  title: string;
  description: string;
  image: ArtworkImage;
  position: SpatialPosition;
  createdAt: number;
  /** Preloaded demo artwork (restored by "reset gallery"). */
  isSample: boolean;
};

// Data needed to store a new artwork; the repository assigns id, createdAt and isSample.
export type NewArtwork = {
  title: string;
  description: string;
  image: ArtworkImage;
  position: SpatialPosition;
};
