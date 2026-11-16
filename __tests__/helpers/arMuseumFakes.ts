import { Artwork, NewArtwork } from "@/src/features/ar-museum/domain/entities/Artwork";
import { DeviceOrientation } from "@/src/features/ar-museum/domain/entities/DeviceOrientation";
import { IArtworkRepository } from "@/src/features/ar-museum/domain/repositories/IArtworkRepository";
import { ISpatialTracker, OrientationListener } from "@/src/features/ar-museum/domain/services/ISpatialTracker";

// Shared test doubles for the AR museum's domain interfaces.

export const makeArtwork = (overrides: Partial<Artwork> = {}): Artwork => ({
  id: "a1",
  title: "Obra de prueba",
  description: "Descripción",
  image: { kind: "bundled", key: "starry-night" },
  position: { yaw: 0, pitch: 0, distance: 2 },
  createdAt: 1,
  isSample: true,
  ...overrides,
});

export class InMemoryArtworkRepository implements IArtworkRepository {
  constructor(
    public artworks: Artwork[] = [],
    private readonly samples: Artwork[] = [],
  ) {}

  async getAll() {
    return this.artworks;
  }

  async add(input: NewArtwork) {
    const created: Artwork = { ...input, id: `id-${this.artworks.length + 1}`, createdAt: Date.now(), isSample: false };
    this.artworks = [...this.artworks, created];
    return created;
  }

  async delete(id: string) {
    this.artworks = this.artworks.filter((a) => a.id !== id);
  }

  async reset() {
    this.artworks = [...this.samples];
    return this.artworks;
  }
}

export class FakeSpatialTracker implements ISpatialTracker {
  listeners = new Set<OrientationListener>();
  current: DeviceOrientation | null = null;
  recalibrations = 0;
  available = true;

  async isAvailable() {
    return this.available;
  }

  subscribe(listener: OrientationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentOrientation() {
    return this.current;
  }

  recalibrate() {
    this.recalibrations++;
  }

  /** Simulates a sensor reading. */
  emit(orientation: Omit<DeviceOrientation, "timestamp">) {
    this.current = { ...orientation, timestamp: Date.now() };
    this.listeners.forEach((l) => l(this.current!));
  }
}
