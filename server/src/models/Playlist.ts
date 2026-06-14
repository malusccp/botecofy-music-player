import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { RHYTHMS } from "./enums.js";

const playlistSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    rhythms: {
      type: [{ type: String, enum: RHYTHMS }],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Playlist deve ter ao menos um ritmo.",
      },
    },
    isPublic: { type: Boolean, default: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tracks: [{ type: Schema.Types.ObjectId, ref: "Track" }],
  },
  { timestamps: true }
);

// RN05: nome único por curador.
playlistSchema.index({ owner: 1, name: 1 }, { unique: true });

export type PlaylistAttrs = InferSchemaType<typeof playlistSchema>;
export type PlaylistDoc = HydratedDocument<PlaylistAttrs>;

export const PlaylistModel = model("Playlist", playlistSchema);
