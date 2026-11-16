import { ImageSource } from "expo-image";

import { ArtworkImage } from "../../domain/entities/Artwork";

// Images bundled with the app for the sample artworks (see data/datasources/sampleArtworks.ts).
// Keys must match the `image.key` of each sample. Replace the files keeping their names to change them.
const SAMPLE_IMAGES: Record<string, number> = {
  "starry-night": require("@/assets/images/ar-museum/starry-night.jpg"),
  "great-wave": require("@/assets/images/ar-museum/great-wave.jpg"),
  "pearl-earring": require("@/assets/images/ar-museum/pearl-earring.jpg"),
};

/** Turns the domain's image reference into something <Image> can display. */
export function resolveArtworkImage(image: ArtworkImage): ImageSource | number | null {
  if (image.kind === "uri") return { uri: image.uri };
  return SAMPLE_IMAGES[image.key] ?? null;
}
