import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { RHYTHMS, TRACK_STATUS } from "./enums.js";

const trackSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    rhythm: { type: String, enum: RHYTHMS, required: true, index: true },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String, default: "" },
    durationSec: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: TRACK_STATUS, default: "active", index: true },
    playsCount: { type: Number, default: 0, min: 0 },
    likesCount: { type: Number, default: 0, min: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// RN02: título único por artista entre faixas ativas (índice único parcial).
trackSchema.index(
  { artist: 1, title: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

// Busca textual por título/artista (HU02).
trackSchema.index({ title: "text", artist: "text" });

export type TrackAttrs = InferSchemaType<typeof trackSchema>;
export type TrackDoc = HydratedDocument<TrackAttrs>;

export const TrackModel = model("Track", trackSchema);
