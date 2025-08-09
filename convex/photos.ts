import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upload = mutation({
  args: { 
    title: v.optional(v.string()), 
    description: v.optional(v.string()),
    imageId: v.id("_storage"),
    tags: v.array(v.string()),
    isFavorite: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const photoId = await ctx.db.insert("photos", {
      title: args.title,
      description: args.description,
      imageId: args.imageId,
      tags: args.tags,
      isFavorite: args.isFavorite ?? false,
      uploadedAt: Date.now(),
    });
    return photoId;
  },
});

export const getAllPhotos = query({
  handler: async (ctx) => {
    const photos = await ctx.db
      .query("photos")
      .order("desc")
      .collect();
    
    return await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        imageUrl: await ctx.storage.getUrl(photo.imageId),
      }))
    );
  },
});

export const getFavorites = query({
  handler: async (ctx) => {
    const favorites = await ctx.db
      .query("photos")
      .filter((q) => q.eq(q.field("isFavorite"), true))
      .order("desc")
      .collect();
    
    return await Promise.all(
      favorites.map(async (photo) => ({
        ...photo,
        imageUrl: await ctx.storage.getUrl(photo.imageId),
      }))
    );
  },
});

export const toggleFavorite = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.id);
    if (!photo) {
      throw new Error("Photo not found");
    }
    
    await ctx.db.patch(args.id, {
      isFavorite: !photo.isFavorite,
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const deletePhoto = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.id);
    if (!photo) {
      throw new Error("Photo not found");
    }
    
    // Delete the image from storage
    await ctx.storage.delete(photo.imageId);
    
    // Delete the photo record from database
    await ctx.db.delete(args.id);
  },
});

export const updatePhoto = mutation({
  args: { 
    id: v.id("photos"),
    description: v.optional(v.string()),
    tags: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.id);
    if (!photo) {
      throw new Error("Photo not found");
    }
    
    // Update photo metadata
    await ctx.db.patch(args.id, {
      description: args.description,
      tags: args.tags,
    });
  },
});