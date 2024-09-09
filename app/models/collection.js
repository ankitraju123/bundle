import mongoose, { Schema } from "mongoose";

const CollectionSchema = new Schema({
  title: { type: String, required: true },
  handle: { type: String, required: true },
  image: { type: String, required: false },
  bunches: { type: [String], required: false },
  products: { type: [String], required: false }
}, { timestamps: true, strict: false })

export const CollectionsModel = mongoose.models.collections || mongoose.model("collections", CollectionSchema)