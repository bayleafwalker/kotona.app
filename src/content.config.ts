import { defineCollection, z } from "astro:content";

const sharedEntrySchema = {
  title: z.string().min(1),
  summary: z.string().max(280).optional(),
  date: z.coerce.date(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(true),
};

const posts = defineCollection({
  type: "content",
  schema: z.object({
    ...sharedEntrySchema,
    contextWindow: z.string().min(1).optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    ...sharedEntrySchema,
    project: z.string().min(1),
    status: z.string().min(1).optional(),
    repoUrls: z.array(z.string().url()).default([]),
    externalUrl: z.string().url().optional(),
  }),
});

export const collections = {
  projects,
  posts,
};
