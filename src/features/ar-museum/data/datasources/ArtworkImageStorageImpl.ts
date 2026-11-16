import { Directory, File, Paths } from "expo-file-system";

import { ArtworkImageStorage } from "./ArtworkImageStorage";

const FOLDER_NAME = "ar-museum";

export class ArtworkImageStorageImpl implements ArtworkImageStorage {
  async persist(sourceUri: string, id: string): Promise<string> {
    const folder = new Directory(Paths.document, FOLDER_NAME);
    if (!folder.exists) folder.create({ intermediates: true });

    const extension = sourceUri.match(/\.(\w{3,4})(?:\?.*)?$/)?.[1]?.toLowerCase() ?? "jpg";
    const destination = new File(folder, `${id}.${extension}`);
    await new File(sourceUri).copy(destination);
    return destination.uri;
  }

  async remove(uri: string): Promise<void> {
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch (e) {
      // A missing file must not block deleting the artwork itself.
      console.warn(`Could not delete image ${uri}`, e);
    }
  }
}
