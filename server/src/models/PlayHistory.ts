import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

const playHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    track: { type: Schema.Types.ObjectId, ref: "Track", required: true },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

playHistorySchema.index({ user: 1, playedAt: -1 });

export type PlayHistoryAttrs = InferSchemaType<typeof playHistorySchema>;
export type PlayHistoryDoc = HydratedDocument<PlayHistoryAttrs>;

export const PlayHistoryModel = model("PlayHistory", playHistorySchema);
