import { Artwork } from "../entities/Artwork";
import { IArtworkRepository } from "../repositories/IArtworkRepository";

// "Reset room": removes the user's artworks and brings back the preloaded samples.
export class ResetGalleryUseCase {
  constructor(private readonly repository: IArtworkRepository) {}

  execute(): Promise<Artwork[]> {
    return this.repository.reset();
  }
}
