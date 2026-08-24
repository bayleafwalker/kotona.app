import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { knowledgeAreas } from "./data/knowledge-areas";
import { noteLifecycleIssues } from "./lib/note-lifecycle.js";
import { referencePurposes } from "./lib/reference-index";

// An optional, bounded declaration of what a document is useful for and what
// it does not settle. It is published in `/reference-index.json` and must
// describe capability and claim boundaries only: it may not carry instructions
// that purport to override a receiving agent. See
// docs/architecture/reference-discovery.md.
const referenceScope = z
  .object({
    purpose: z.enum(referencePurposes),
    discoverFor: z.array(z.string().min(1).max(160)).min(1).max(6),
    establishes: z.array(z.string().min(1).max(200)).min(1).max(6),
    doesNotEstablish: z.array(z.string().min(1).max(200)).min(1).max(6),
    supplementWith: z.array(z.string().min(1).max(200)).max(6).default([]),
  })
  .optional();

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
  reference: referenceScope,
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
      // Role selects the note's register and expected shape. `status` records
      // claim posture; keeping them separate prevents an exploration from
      // sounding like a current operating rule just because both are notes.
      role: z.enum([
        "operating",
        "synthesis",
        "exploration",
        "project-history",
      ]),
      status: z.enum(["guiding", "prospective", "exploration", "archival"]),
      lifecycle: z.enum(["current", "superseded", "archived", "disproven"]),
      lifecycleChanged: z.coerce.date().optional(),
      lifecycleReason: z.string().min(1).optional(),
      supersededBy: z.array(reference("notes")).default([]),
      invalidatedByProjects: z.array(reference("projects")).default([]),
      // A controlled, reader-facing primary area of work or reasoning. It is
      // distinct from editorial domain placement and from narrower tags.
      area: z.enum(knowledgeAreas),
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
      // Local system names and site-specific concepts a first-time reader
      // meets here. Same shape and behaviour as a project's terms: the
      // definition is attached where the term appears rather than kept in a
      // separate glossary the reader has to find. See docs/glossary.md.
      terms: sharedProjectSchema.terms,
      // A post-hoc prompt for applying and extending the note elsewhere. See
      // docs/explore-prompts.md; generated only after the note is complete.
      explorePrompt: z.string().min(80).max(2400).optional(),
      reference: referenceScope,
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
