import mongoose, { Schema, Document } from "mongoose";
import { Attachment } from "../../../domain/entities/Attachment";

type AttachmentWithoutId = Omit<Attachment, "id">;

export interface IAttachmentModel extends AttachmentWithoutId, Document {
  id: number;
}

const attachmentSchema = new Schema<IAttachmentModel>(
  {
    id: { type: Number, required: true, unique: true },
    collection_name: String,
    name: String,
    file_name: String,
    mime_type: String,
    disk: String,
    conversions_disk: String,
    size: String,
    original_url: String,
    created_by_id: Number,
    created_at: String,
    updated_at: String,
    deleted_at: String,
  },
  {
    timestamps: false,
  }
);

export default mongoose.model<IAttachmentModel>("Attachment", attachmentSchema);
