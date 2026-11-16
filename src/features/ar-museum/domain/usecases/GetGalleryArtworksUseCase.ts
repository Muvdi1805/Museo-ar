import { Artwork } from "../entities/Artwork";
import { IArtworkRepository } from "../repositories/IArtworkRepository";

// Returns the artworks of the room, farthest first so nearer frames are drawn on top.
export class GetGalleryArtworksUseCase {
  constructor(private readonly repository: IArtworkRepository) {}

  async execute(): Promise<Artwork[]> {
    const artworks = await this.repository.getAll();
    return [...artworks].sort((a, b) => b.position.distance - a.position.distance || a.createdAt - b.createdAt);
  }
}
