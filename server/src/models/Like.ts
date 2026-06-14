import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    track: { type: Schema.Types.ObjectId, ref: "Track", required: true },
  },
  { timestamps: true }
);

// RN07: um ouvinte curte uma faixa no máximo uma vez.
likeSchema.index({ user: 1, track: 1 }, { unique: true });

export type LikeAttrs = InferSchemaType<typeof likeSchema>;
export type LikeDoc = HydratedDocument<LikeAttrs>;

export const LikeModel = model("Like", likeSchema);
