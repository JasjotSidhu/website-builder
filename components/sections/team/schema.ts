import { z } from "zod";
import { sectionDataSourceSchema } from "@/lib/collections/schemas";

export const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export const teamGridSchema = z
  .object({
    eyebrow: z.string().optional(),
    heading: z.string().min(1),
    subheading: z.string().optional(),
    dataSource: sectionDataSourceSchema.optional(),
    members: z.array(teamMemberSchema).max(12).optional(),
  })
  .superRefine((data, ctx) => {
    const mode = data.dataSource?.mode ?? "inline";
    if (mode === "inline" && (!data.members || data.members.length < 1)) {
      ctx.addIssue({
        code: "custom",
        message: "At least one team member is required in inline mode.",
        path: ["members"],
      });
    }
  });

export type TeamGridProps = z.infer<typeof teamGridSchema>;
