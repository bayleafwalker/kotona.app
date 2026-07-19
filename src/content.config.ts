import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { noteLifecycleIssues } from "./lib/note-lifecycle.js";

const sharedProjectSchema = {
  title: z.string().min(1),
  seoTitle: z.string().min(1).max(120).optional(),
  socialTitle: z.string().min(1).max(120).optional(),
  summary: z.string().max(280).optional(),
  published: z.coerce.date(),
  lastRevised: z.coerce.date(),
  lastVerified: z.coerce.date(),
  tags: z.array(z.string().min(1)).default([]),
  terms: z
    .array(
      z.object({
        term: z.string().min(1),
        definition: z.string().min(1).max(240),
      }),
    )
    .default([]),
  draft: z.boolean().default(true),
};

const notes = defineCollection({
  loader: glob({
    base: "./src/content/notes",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z
    .object({
      title: z.string().min(1),
      seoTitle: z.string().min(1).max(120).optional(),
      socialTitle: z.string().min(1).max(120).optional(),
      summary: z.string().max(280).optional(),
      status: z.enum(["guiding", "prospective", "exploration", "archival"]),
      lifecycle: z.enum(["current", "superseded", "archived", "disproven"]),
      lifecycleChanged: z.coerce.date().optional(),
      lifecycleReason: z.string().min(1).optional(),
      supersededBy: z.array(reference("notes")).default([]),
      invalidatedByProjects: z.array(reference("projects")).default([]),
      area: z.string().min(1),
      published: z.coerce.date(),
      lastRevised: z.coerce.date(),
      projects: z.array(reference("projects")).default([]),
      relates: z.array(reference("notes")).default([]),
      tags: z.array(z.string().min(1)).default([]),
      hero: z
        .object({
          src: z.string().regex(/^\/[\w./-]+\.(avif|jpe?g|png|webp)$/i),
          alt: z.string().min(1),
          caption: z.string().min(1).optional(),
          width: z.number().int().positive(),
          height: z.number().int().positive(),
        })
        .optional(),
      draft: z.boolean().default(false),
    })
    .superRefine((note, context) => {
      for (const issue of noteLifecycleIssues(note)) {
        context.addIssue({
          code: "custom",
          path: [issue.path],
          message: issue.message,
        });
      }
    }),
});

const projects = defineCollection({
  loader: glob({
    base: "./src/content/projects",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    ...sharedProjectSchema,
    project: z.string().min(1),
    kind: z.enum(["engineering", "fiction"]).default("engineering"),
    status: z.string().min(1),
    featured: z.boolean().default(false),
    repoUrls: z.array(z.url()).default([]),
    externalUrl: z.url().optional(),
    evidence: z.object({
      capability: z.string().min(1),
      latest: z.string().min(1).optional(),
      proofLinks: z
        .array(
          z.object({
            label: z.string().min(1),
            href: z.union([z.url(), z.string().regex(/^\/[\w./-]*$/)]),
          }),
        )
        .min(1),
      integrations: z.array(z.string().min(1)).default([]),
      knownLimitation: z.string().min(1),
      nextProof: z.string().min(1),
    }),
  }),
});

export const collections = {
  notes,
  projects,
};
