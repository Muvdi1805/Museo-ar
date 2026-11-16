// Keeps the photos the user adds. The image picker returns files in a temporary cache that the
// OS may clear, so they are copied to the app's own storage before being saved in the gallery.
export interface ArtworkImageStorage {
  /** Copies the image to permanent storage and returns its new URI. */
  persist(sourceUri: string, id: string): Promise<string>;
  remove(uri: string): Promise<void>;
}
