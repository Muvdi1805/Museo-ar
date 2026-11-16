import { IArtworkRepository } from "../repositories/IArtworkRepository";

export class DeleteArtworkUseCase {
  constructor(private readonly repository: IArtworkRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) throw new Error("Falta el identificador de la obra.");
    await this.repository.delete(id);
  }
}
