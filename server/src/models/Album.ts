import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { RHYTHMS } from "./enums.js";

const albumSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true, index: true },
    coverUrl: { type: String, default: "" },
    rhythm: { type: String, enum: RHYTHMS },
    tracks: [{ type: Schema.Types.ObjectId, ref: "Track" }],
    // Desnormalizado: soma de playsCount das faixas do álbum (ordenação de "Recomendações de Álbuns").
    popularity: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

albumSchema.index({ artist: 1, title: 1 }, { unique: true });

export type AlbumAttrs = InferSchemaType<typeof albumSchema>;
export type AlbumDoc = HydratedDocument<AlbumAttrs>;

export const AlbumModel = model("Album", albumSchema);
