import { DeleteArtworkUseCase } from "@/src/features/ar-museum/domain/usecases/DeleteArtworkUseCase";
import { GetGalleryArtworksUseCase } from "@/src/features/ar-museum/domain/usecases/GetGalleryArtworksUseCase";
import { ObserveDeviceOrientationUseCase } from "@/src/features/ar-museum/domain/usecases/ObserveDeviceOrientationUseCase";
import { RecalibrateSpatialTrackerUseCase } from "@/src/features/ar-museum/domain/usecases/RecalibrateSpatialTrackerUseCase";
import { ResetGalleryUseCase } from "@/src/features/ar-museum/domain/usecases/ResetGalleryUseCase";
import { FakeSpatialTracker, InMemoryArtworkRepository, makeArtwork } from "../../helpers/arMuseumFakes";

describe("GetGalleryArtworksUseCase", () => {
  it("returns artworks farthest first, so nearer frames are drawn on top", async () => {
    const repo = new InMemoryArtworkRepository([
      makeArtwork({ id: "near", position: { yaw: 0, pitch: 0, distance: 1 } }),
      makeArtwork({ id: "far", position: { yaw: 0, pitch: 0, distance: 5 } }),
    ]);
    const result = await new GetGalleryArtworksUseCase(repo).execute();
    expect(result.map((a) => a.id)).toEqual(["far", "near"]);
  });
});

describe("DeleteArtworkUseCase", () => {
  it("removes the artwork", async () => {
    const repo = new InMemoryArtworkRepository([makeArtwork({ id: "a" }), makeArtwork({ id: "b" })]);
    await new DeleteArtworkUseCase(repo).execute("a");
    expect(repo.artworks.map((a) => a.id)).toEqual(["b"]);
  });

  it("rejects an empty id", async () => {
    await expect(new DeleteArtworkUseCase(new InMemoryArtworkRepository()).execute("")).rejects.toThrow();
  });
});

describe("ResetGalleryUseCase", () => {
  it("restores the samples", async () => {
    const sample = makeArtwork({ id: "sample" });
    const repo = new InMemoryArtworkRepository([makeArtwork({ id: "mine", isSample: false })], [sample]);
    const result = await new ResetGalleryUseCase(repo).execute();
    expect(result).toEqual([sample]);
  });
});

describe("tracker use cases", () => {
  it("forwards orientation updates until unsubscribed", () => {
    const tracker = new FakeSpatialTracker();
    const listener = jest.fn();
    const stop = new ObserveDeviceOrientationUseCase(tracker).execute(listener);

    tracker.emit({ yaw: 10, pitch: 0, roll: 0 });
    stop();
    tracker.emit({ yaw: 20, pitch: 0, roll: 0 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({ yaw: 10 });
  });

  it("recalibrates the tracker", () => {
    const tracker = new FakeSpatialTracker();
    new RecalibrateSpatialTrackerUseCase(tracker).execute();
    expect(tracker.recalibrations).toBe(1);
  });
});
