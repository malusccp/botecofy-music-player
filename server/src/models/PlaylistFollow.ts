import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

const playlistFollowSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    playlist: { type: Schema.Types.ObjectId, ref: "Playlist", required: true },
  },
  { timestamps: true }
);

playlistFollowSchema.index({ user: 1, playlist: 1 }, { unique: true });

export type PlaylistFollowAttrs = InferSchemaType<typeof playlistFollowSchema>;
export type PlaylistFollowDoc = HydratedDocument<PlaylistFollowAttrs>;

export const PlaylistFollowModel = model("PlaylistFollow", playlistFollowSchema);
