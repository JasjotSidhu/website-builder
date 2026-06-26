import { z } from "zod";

export const sectionDataSourceSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("inline") }),
  z.object({
    mode: z.literal("collection"),
    collectionId: z.string().min(1),
    limit: z.number().int().positive().optional(),
    sort: z.enum(["manual", "newest", "oldest"]).optional(),
    itemIds: z.array(z.string().min(1)).optional(),
  }),
]);
