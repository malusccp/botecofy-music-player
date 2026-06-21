import { ArtistModel, type ArtistDoc } from "../models/Artist.js";
import type { IArtistRepository } from "./interfaces.js";

/** Acesso a dados de artistas via Mongoose (padrão Repository). */
export class ArtistRepository implements IArtistRepository {
  findById(id: string): Promise<ArtistDoc | null> {
    return ArtistModel.findById(id).exec();
  }

  findByName(name: string): Promise<ArtistDoc | null> {
    return ArtistModel.findOne({ name }).exec();
  }

  create(data: Record<string, unknown>): Promise<ArtistDoc> {
    return ArtistModel.create(data);
  }

  update(id: string, data: Partial<Record<string, unknown>>): Promise<ArtistDoc | null> {
    return ArtistModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await ArtistModel.findByIdAndDelete(id).exec();
  }

  list(limit: number): Promise<ArtistDoc[]> {
    return ArtistModel.find({}).sort({ popularity: -1 }).limit(limit).exec();
  }
}
