import { defineCollection, z } from "astro:content";

const sharedEntrySchema = {
  title: z.string().min(1),
  summary: z.string().max(280).optional(),
  date: z.coerce.date(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(true),
};

const notes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().max(280).optional(),
    status: z.string().min(1),
    area: z.string().min(1),
    lastRevised: z.coerce.date(),
    relates: z.array(z.string().min(1)).default([]),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    ...sharedEntrySchema,
    project: z.string().min(1),
    kind: z.enum(["engineering", "fiction"]).default("engineering"),
    status: z.string().min(1).optional(),
    repoUrls: z.array(z.string().url()).default([]),
    externalUrl: z.string().url().optional(),
  }),
});

export const collections = {
  notes,
  projects,
};
