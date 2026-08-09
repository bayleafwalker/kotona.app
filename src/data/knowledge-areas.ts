/**
 * Controlled public vocabulary for a note's primary area of work or reasoning.
 * An area is not a domain, tag, lifecycle state, or claim posture. It answers
 * what kind of work the note primarily demonstrates, and is used by discovery
 * surfaces as one concise piece of reader-facing context.
 */
export const knowledgeAreas = [
  "agent architecture",
  "agent infrastructure",
  "agent workflow",
  "architecture practice",
  "authentication architecture",
  "career",
  "cluster operations",
  "contract governance",
  "creative tooling",
  "data architecture",
  "energy systems",
  "GitOps operations",
  "hardware contracts",
  "homelab operations",
  "model evaluation",
  "open source",
  "organizational systems",
  "release engineering",
  "software architecture",
  "software assurance",
] as const;

export type KnowledgeArea = (typeof knowledgeAreas)[number];
