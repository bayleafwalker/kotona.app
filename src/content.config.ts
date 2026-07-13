import { defineCollection, reference, z } from "astro:content";

const sharedProjectSchema = {
  title: z.string().min(1),
  summary: z.string().max(280).optional(),
  published: z.coerce.date(),
  lastRevised: z.coerce.date(),
  lastVerified: z.coerce.date(),
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
    published: z.coerce.date(),
    lastRevised: z.coerce.date(),
    projects: z.array(reference("projects")).default([]),
    relates: z.array(reference("notes")).default([]),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    ...sharedProjectSchema,
    project: z.string().min(1),
    kind: z.enum(["engineering", "fiction"]).default("engineering"),
    status: z.string().min(1),
    featured: z.boolean().default(false),
    repoUrls: z.array(z.string().url()).default([]),
    externalUrl: z.string().url().optional(),
  }),
});

export const collections = {
  notes,
  projects,
};
