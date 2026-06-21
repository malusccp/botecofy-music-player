import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { RHYTHMS } from "./enums.js";

const artistSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    photoUrl: { type: String, default: "" },
    rhythms: { type: [{ type: String, enum: RHYTHMS }], default: [] },
    // Desnormalizado: soma de playsCount das faixas do artista (ordenação de "Artistas do Momento").
    popularity: { type: Number, default: 0, min: 0 },
    // Já tentamos buscar a foto na Deezer? Evita repetir a chamada externa.
    photoChecked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type ArtistAttrs = InferSchemaType<typeof artistSchema>;
export type ArtistDoc = HydratedDocument<ArtistAttrs>;

export const ArtistModel = model("Artist", artistSchema);
