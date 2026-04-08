import { defineCollection, z } from "astro:content";

const baseEntrySchema = {
  title: z.string().min(1),
  summary: z.string().max(280).optional(),
  date: z.coerce.date(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(true),
};

const posts = defineCollection({
  type: "content",
  schema: z.object(baseEntrySchema),
});

const caseStudies = defineCollection({
  type: "content",
  schema: z.object({
    ...baseEntrySchema,
    project: z.string().min(1),
    status: z.string().min(1).optional(),
    repoUrl: z.string().url().optional(),
    externalUrl: z.string().url().optional(),
  }),
});

export const collections = {
  "case-studies": caseStudies,
  posts,
};
