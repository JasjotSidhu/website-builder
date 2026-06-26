import { z } from "zod";
import { sectionDataSourceSchema } from "@/lib/collections/schemas";

export const blogPostCardSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  coverImage: z.string().optional(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  featured: z.boolean().optional(),
});

export const blogListSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  displayMode: z.enum(["featured", "all", "limit"]).optional(),
  postLimit: z.number().int().positive().max(24).optional(),
  dataSource: sectionDataSourceSchema.optional(),
  posts: z.array(blogPostCardSchema).optional(),
});

export type BlogListProps = z.infer<typeof blogListSchema>;
