import { Artwork } from "../../domain/entities/Artwork";

// Raw storage access for the gallery.
export interface ArtworkLocalDataSource {
  /** Stored artworks, or null if the gallery was never saved (first launch). */
  getAll(): Promise<Artwork[] | null>;
  saveAll(artworks: Artwork[]): Promise<void>;
}
