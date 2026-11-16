import { Artwork } from "../entities/Artwork";
import { IArtworkRepository } from "../repositories/IArtworkRepository";
import { ISpatialTracker } from "../services/ISpatialTracker";
import { clamp, normalizeAngle, REFERENCE_DISTANCE } from "../services/spatialProjection";

export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 200;
/** Artworks cannot be pinned too close to the zenith/nadir, where heading becomes meaningless. */
export const MAX_PLACEMENT_PITCH = 70;

export type PlaceArtworkInput = {
  title: string;
  description: string;
  /** Local URI of the photo chosen from the gallery or taken with the camera. */
  imageUri: string;
  distance?: number;
};

// Pins a new artwork exactly where the device is pointing right now.
export class PlaceArtworkUseCase {
  constructor(
    private readonly repository: IArtworkRepository,
    private readonly tracker: ISpatialTracker,
  ) {}

  async execute(input: PlaceArtworkInput): Promise<Artwork> {
    const title = input.title.trim();
    const description = input.description.trim();

    if (!title) throw new Error("La obra necesita un título.");
    if (title.length > MAX_TITLE_LENGTH) {
      throw new Error(`El título no puede superar ${MAX_TITLE_LENGTH} caracteres.`);
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(`La descripción no puede superar ${MAX_DESCRIPTION_LENGTH} caracteres.`);
    }
    if (!input.imageUri.trim()) throw new Error("Selecciona o toma una foto primero.");

    const orientation = this.tracker.getCurrentOrientation();
    if (!orientation) {
      throw new Error("Los sensores aún no reportan la orientación. Mueve el teléfono e inténtalo de nuevo.");
    }

    return this.repository.add({
      title,
      description,
      image: { kind: "uri", uri: input.imageUri },
      position: {
        yaw: normalizeAngle(orientation.yaw),
        pitch: clamp(orientation.pitch, -MAX_PLACEMENT_PITCH, MAX_PLACEMENT_PITCH),
        distance: input.distance ?? REFERENCE_DISTANCE,
      },
    });
  }
}
