// One token per dependency registered in the container (see appContainer.ts).
export const TOKENS = {
  LocalPreferences: Symbol("LocalPreferences"),

  // AR museum: data
  ArtworkLocalDS: Symbol("ArtworkLocalDS"),
  ArtworkImageStorage: Symbol("ArtworkImageStorage"),
  ArtworkRepo: Symbol("ArtworkRepo"),
  SpatialTracker: Symbol("SpatialTracker"),

  // AR museum: use cases (the only dependencies presentation resolves)
  PlaceArtworkUC: Symbol("PlaceArtworkUC"),
  GetGalleryArtworksUC: Symbol("GetGalleryArtworksUC"),
  DeleteArtworkUC: Symbol("DeleteArtworkUC"),
  ResetGalleryUC: Symbol("ResetGalleryUC"),
  ObserveDeviceOrientationUC: Symbol("ObserveDeviceOrientationUC"),
  RecalibrateSpatialTrackerUC: Symbol("RecalibrateSpatialTrackerUC"),
} as const;
