import { Artwork, NewArtwork } from "../entities/Artwork";

// What the app can do with the gallery. Use cases depend on this interface, never on an implementation.
export interface IArtworkRepository {
  getAll(): Promise<Artwork[]>;
  add(artwork: NewArtwork): Promise<Artwork>;
  delete(id: string): Promise<void>;
  /** Removes every artwork and restores the preloaded samples. */
  reset(): Promise<Artwork[]>;
}
