import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { Artwork } from "../../domain/entities/Artwork";
import { ArtworkLocalDataSource } from "./ArtworkLocalDataSource";

const ARTWORKS_KEY = "ar-museum.artworks";

export class ArtworkLocalDataSourceImpl implements ArtworkLocalDataSource {
  constructor(private readonly prefs: ILocalPreferences) {}

  getAll(): Promise<Artwork[] | null> {
    return this.prefs.retrieveData<Artwork[]>(ARTWORKS_KEY);
  }

  saveAll(artworks: Artwork[]): Promise<void> {
    return this.prefs.storeData<Artwork[]>(ARTWORKS_KEY, artworks);
  }
}
