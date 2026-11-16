import { Artwork, NewArtwork } from "../../domain/entities/Artwork";
import { IArtworkRepository } from "../../domain/repositories/IArtworkRepository";
import { ArtworkImageStorage } from "../datasources/ArtworkImageStorage";
import { ArtworkLocalDataSource } from "../datasources/ArtworkLocalDataSource";

export class ArtworkRepositoryImpl implements IArtworkRepository {
  constructor(
    private readonly dataSource: ArtworkLocalDataSource,
    private readonly imageStorage: ArtworkImageStorage,
    private readonly samples: Artwork[],
  ) {}

  async getAll(): Promise<Artwork[]> {
    const stored = await this.dataSource.getAll();
    if (stored) return stored;

    // First launch: seed the room so the demo has something to show right away.
    await this.dataSource.saveAll(this.samples);
    return this.samples;
  }

  async add(artwork: NewArtwork): Promise<Artwork> {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const image =
      artwork.image.kind === "uri"
        ? { kind: "uri" as const, uri: await this.imageStorage.persist(artwork.image.uri, id) }
        : artwork.image;

    const created: Artwork = { ...artwork, id, image, createdAt: Date.now(), isSample: false };
    const artworks = await this.getAll();
    await this.dataSource.saveAll([...artworks, created]);
    return created;
  }

  async delete(id: string): Promise<void> {
    const artworks = await this.getAll();
    const target = artworks.find((a) => a.id === id);
    if (!target) return;

    await this.dataSource.saveAll(artworks.filter((a) => a.id !== id));
    await this.removeImage(target);
  }

  async reset(): Promise<Artwork[]> {
    const artworks = await this.getAll();
    await this.dataSource.saveAll(this.samples);
    await Promise.all(artworks.map((a) => this.removeImage(a)));
    return this.samples;
  }

  private async removeImage(artwork: Artwork) {
    if (artwork.image.kind === "uri") await this.imageStorage.remove(artwork.image.uri);
  }
}
