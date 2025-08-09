import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  photos: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageId: v.id("_storage"),
    tags: v.array(v.string()),
    isFavorite: v.boolean(),
    uploadedAt: v.number(),
  }).index("by_uploadedAt", ["uploadedAt"]),
});