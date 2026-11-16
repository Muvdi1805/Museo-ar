import { ArtworkImageStorageImpl } from "@/src/features/ar-museum/data/datasources/ArtworkImageStorageImpl";
import { ArtworkLocalDataSourceImpl } from "@/src/features/ar-museum/data/datasources/ArtworkLocalDataSourceImpl";
import { SAMPLE_ARTWORKS } from "@/src/features/ar-museum/data/datasources/sampleArtworks";
import { ArtworkRepositoryImpl } from "@/src/features/ar-museum/data/repositories/ArtworkRepositoryImpl";
import { ExpoSensorsSpatialTracker } from "@/src/features/ar-museum/data/sensors/ExpoSensorsSpatialTracker";
import { IArtworkRepository } from "@/src/features/ar-museum/domain/repositories/IArtworkRepository";
import { ISpatialTracker } from "@/src/features/ar-museum/domain/services/ISpatialTracker";
import { DeleteArtworkUseCase } from "@/src/features/ar-museum/domain/usecases/DeleteArtworkUseCase";
import { GetGalleryArtworksUseCase } from "@/src/features/ar-museum/domain/usecases/GetGalleryArtworksUseCase";
import { ObserveDeviceOrientationUseCase } from "@/src/features/ar-museum/domain/usecases/ObserveDeviceOrientationUseCase";
import { PlaceArtworkUseCase } from "@/src/features/ar-museum/domain/usecases/PlaceArtworkUseCase";
import { RecalibrateSpatialTrackerUseCase } from "@/src/features/ar-museum/domain/usecases/RecalibrateSpatialTrackerUseCase";
import { ResetGalleryUseCase } from "@/src/features/ar-museum/domain/usecases/ResetGalleryUseCase";
import { ILocalPreferences } from "../iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "../LocalPreferencesAsyncStorage";
import { Container } from "./container";
import { TOKENS } from "./tokens";

// Composition root: the only place that knows which implementation backs each interface.
// To switch a feature to another backend (e.g. Roble), change the data source created here.
export function createAppContainer(): Container {
  const c = new Container();

  const prefs: ILocalPreferences = LocalPreferencesAsyncStorage.getInstance();
  c.register(TOKENS.LocalPreferences, prefs);

  // AR museum — data
  const artworkDS = new ArtworkLocalDataSourceImpl(prefs);
  const imageStorage = new ArtworkImageStorageImpl();
  const artworkRepo: IArtworkRepository = new ArtworkRepositoryImpl(artworkDS, imageStorage, SAMPLE_ARTWORKS);
  const tracker: ISpatialTracker = new ExpoSensorsSpatialTracker();
  c.register(TOKENS.ArtworkLocalDS, artworkDS)
    .register(TOKENS.ArtworkImageStorage, imageStorage)
    .register(TOKENS.ArtworkRepo, artworkRepo)
    .register(TOKENS.SpatialTracker, tracker);

  // AR museum — use cases
  c.register(TOKENS.PlaceArtworkUC, new PlaceArtworkUseCase(artworkRepo, tracker))
    .register(TOKENS.GetGalleryArtworksUC, new GetGalleryArtworksUseCase(artworkRepo))
    .register(TOKENS.DeleteArtworkUC, new DeleteArtworkUseCase(artworkRepo))
    .register(TOKENS.ResetGalleryUC, new ResetGalleryUseCase(artworkRepo))
    .register(TOKENS.ObserveDeviceOrientationUC, new ObserveDeviceOrientationUseCase(tracker))
    .register(TOKENS.RecalibrateSpatialTrackerUC, new RecalibrateSpatialTrackerUseCase(tracker));

  return c;
}
