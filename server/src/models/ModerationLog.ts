import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

const moderationLogSchema = new Schema(
  {
    track: { type: Schema.Types.ObjectId, ref: "Track", required: true, index: true },
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["deactivate", "reactivate"], required: true },
    reason: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export type ModerationLogAttrs = InferSchemaType<typeof moderationLogSchema>;
export type ModerationLogDoc = HydratedDocument<ModerationLogAttrs>;

export const ModerationLogModel = model("ModerationLog", moderationLogSchema);
