import { Artwork } from "../../domain/entities/Artwork";

// Artworks preloaded on first launch and restored by "reset room".
//
// To use your own pictures as samples:
//  - Easiest: replace the files in assets/images/ar-museum/ keeping the same names.
//  - To add or rename samples: edit this list and the image map in
//    presentation/assets/sampleArtworkImages.ts (the `key` here must match a key there).
//
// Positions: yaw 0 is straight ahead when the viewer opens; positive yaw is to the right.
export const SAMPLE_ARTWORKS: Artwork[] = [
  {
    id: "sample-starry-night",
    title: "La noche estrellada",
    description: "Vincent van Gogh, 1889. Óleo sobre lienzo. Vista nocturna desde la ventana del asilo de Saint-Rémy.",
    image: { kind: "bundled", key: "starry-night" },
    position: { yaw: 0, pitch: 5, distance: 2 },
    createdAt: 0,
    isSample: true,
  },
  {
    id: "sample-great-wave",
    title: "La gran ola de Kanagawa",
    description: "Katsushika Hokusai, c. 1831. Xilografía de la serie «Treinta y seis vistas del monte Fuji».",
    image: { kind: "bundled", key: "great-wave" },
    position: { yaw: 120, pitch: 0, distance: 2.5 },
    createdAt: 1,
    isSample: true,
  },
  {
    id: "sample-pearl-earring",
    title: "La joven de la perla",
    description: "Johannes Vermeer, c. 1665. Óleo sobre lienzo. Conocida como «la Mona Lisa del norte».",
    image: { kind: "bundled", key: "pearl-earring" },
    position: { yaw: -120, pitch: 10, distance: 1.8 },
    createdAt: 2,
    isSample: true,
  },
];
