import { ArtworkImageStorage } from "@/src/features/ar-museum/data/datasources/ArtworkImageStorage";
import { ArtworkLocalDataSource } from "@/src/features/ar-museum/data/datasources/ArtworkLocalDataSource";
import { ArtworkRepositoryImpl } from "@/src/features/ar-museum/data/repositories/ArtworkRepositoryImpl";
import { Artwork } from "@/src/features/ar-museum/domain/entities/Artwork";
import { makeArtwork } from "../../helpers/arMuseumFakes";

// In-memory data source: tests the repository's logic without touching storage.
class InMemoryArtworkDataSource implements ArtworkLocalDataSource {
  stored: Artwork[] | null = null;
  async getAll() {
    return this.stored;
  }
  async saveAll(artworks: Artwork[]) {
    this.stored = artworks;
  }
}

class FakeImageStorage implements ArtworkImageStorage {
  removed: string[] = [];
  async persist(_sourceUri: string, id: string) {
    return `file:///document/ar-museum/${id}.jpg`;
  }
  async remove(uri: string) {
    this.removed.push(uri);
  }
}

describe("ArtworkRepositoryImpl", () => {
  const samples = [makeArtwork({ id: "sample-1" }), makeArtwork({ id: "sample-2" })];
  let ds: InMemoryArtworkDataSource;
  let images: FakeImageStorage;
  let repo: ArtworkRepositoryImpl;

  beforeEach(() => {
    ds = new InMemoryArtworkDataSource();
    images = new FakeImageStorage();
    repo = new ArtworkRepositoryImpl(ds, images, samples);
  });

  it("seeds the sample artworks on first launch", async () => {
    expect(await repo.getAll()).toEqual(samples);
    expect(ds.stored).toEqual(samples);
  });

  it("does not re-seed once the user emptied the room", async () => {
    ds.stored = [];
    expect(await repo.getAll()).toEqual([]);
  });

  it("copies the picked photo to permanent storage when adding", async () => {
    const created = await repo.add({
      title: "Mía",
      description: "",
      image: { kind: "uri", uri: "file:///cache/ImagePicker/tmp.jpg" },
      position: { yaw: 30, pitch: 0, distance: 2 },
    });

    expect(created.isSample).toBe(false);
    expect(created.image).toEqual({ kind: "uri", uri: `file:///document/ar-museum/${created.id}.jpg` });
    expect(ds.stored).toHaveLength(3);
  });

  it("deletes the artwork and its image file", async () => {
    const created = await repo.add({
      title: "Mía",
      description: "",
      image: { kind: "uri", uri: "file:///cache/tmp.jpg" },
      position: { yaw: 0, pitch: 0, distance: 2 },
    });

    await repo.delete(created.id);

    expect(ds.stored?.map((a) => a.id)).toEqual(["sample-1", "sample-2"]);
    expect(images.removed).toEqual([(created.image as { uri: string }).uri]);
  });

  it("never deletes bundled images", async () => {
    await repo.delete("sample-1");
    expect(images.removed).toEqual([]);
    expect(ds.stored?.map((a) => a.id)).toEqual(["sample-2"]);
  });

  it("reset restores the samples and removes the user's files", async () => {
    await repo.add({
      title: "Mía",
      description: "",
      image: { kind: "uri", uri: "file:///cache/tmp.jpg" },
      position: { yaw: 0, pitch: 0, distance: 2 },
    });
    await repo.delete("sample-2");

    const result = await repo.reset();

    expect(result).toEqual(samples);
    expect(ds.stored).toEqual(samples);
    expect(images.removed).toHaveLength(1);
  });
});
