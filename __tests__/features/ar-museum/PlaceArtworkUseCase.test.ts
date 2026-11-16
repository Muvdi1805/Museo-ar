import { MAX_PLACEMENT_PITCH, PlaceArtworkUseCase } from "@/src/features/ar-museum/domain/usecases/PlaceArtworkUseCase";
import { FakeSpatialTracker, InMemoryArtworkRepository } from "../../helpers/arMuseumFakes";

describe("PlaceArtworkUseCase", () => {
  let repo: InMemoryArtworkRepository;
  let tracker: FakeSpatialTracker;
  let useCase: PlaceArtworkUseCase;

  beforeEach(() => {
    repo = new InMemoryArtworkRepository();
    tracker = new FakeSpatialTracker();
    useCase = new PlaceArtworkUseCase(repo, tracker);
  });

  const input = { title: "  Mi foto  ", description: " En clase ", imageUri: "file:///tmp/photo.jpg" };

  it("pins the artwork where the device is pointing", async () => {
    tracker.emit({ yaw: 45, pitch: 10, roll: 0 });

    const created = await useCase.execute(input);

    expect(created.title).toBe("Mi foto");
    expect(created.description).toBe("En clase");
    expect(created.image).toEqual({ kind: "uri", uri: "file:///tmp/photo.jpg" });
    expect(created.position).toEqual({ yaw: 45, pitch: 10, distance: 2 });
    expect(repo.artworks).toHaveLength(1);
  });

  it("limits the pitch so artworks are not pinned at the zenith", async () => {
    tracker.emit({ yaw: 0, pitch: 89, roll: 0 });
    const created = await useCase.execute(input);
    expect(created.position.pitch).toBe(MAX_PLACEMENT_PITCH);
  });

  it("fails when the sensors have not reported yet", async () => {
    await expect(useCase.execute(input)).rejects.toThrow(/sensores/);
    expect(repo.artworks).toHaveLength(0);
  });

  it("requires a title", async () => {
    tracker.emit({ yaw: 0, pitch: 0, roll: 0 });
    await expect(useCase.execute({ ...input, title: "   " })).rejects.toThrow(/título/);
  });

  it("requires an image", async () => {
    tracker.emit({ yaw: 0, pitch: 0, roll: 0 });
    await expect(useCase.execute({ ...input, imageUri: "" })).rejects.toThrow(/foto/);
  });
});
