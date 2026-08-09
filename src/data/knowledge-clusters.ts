export type KnowledgeCluster = {
  id: string;
  label: string;
  summary: string;
  areas: string[];
  strongTags: string[];
  anchors: string[];
  overrides: string[];
  region: { x: number; y: number };
};

/**
 * Reviewed discovery taxonomy. Areas decide membership before tags; overrides
 * handle projects and entries whose public area is deliberately ambiguous.
 */
export const knowledgeClusters: KnowledgeCluster[] = [
  {
    id: "agents-assurance",
    label: "Agent systems, authority, and assurance",
    summary:
      "How delegated work stays bounded, reviewable, attributable, and safe to operate.",
    areas: [
      "agent architecture",
      "agent infrastructure",
      "agent workflow",
      "model evaluation",
      "software assurance",
    ],
    strongTags: ["agents", "ai", "assurance", "authority", "evaluation"],
    anchors: [
      "the-coordinator-never-touches-the-repo",
      "a-field-guide-to-assurance-managed-ai-development",
    ],
    overrides: ["vuoro"],
    region: { x: 190, y: 175 },
  },
  {
    id: "architecture-contracts",
    label: "Architecture, data, and contracts",
    summary:
      "Contracts, reference models, durable data, and boundaries that make change legible.",
    areas: [
      "architecture practice",
      "contract governance",
      "data architecture",
      "software architecture",
    ],
    strongTags: [
      "architecture",
      "contracts",
      "data-platforms",
      "event-sourcing",
    ],
    anchors: [
      "schema-on-split",
      "a-reference-architecture-is-a-hypothesis-library",
    ],
    overrides: ["contract-first-box"],
    region: { x: 500, y: 155 },
  },
  {
    id: "infrastructure-recovery",
    label: "Infrastructure, operations, and recovery",
    summary:
      "Migration, rollback, release, and recovery work in systems that must remain operable.",
    areas: [
      "GitOps operations",
      "authentication architecture",
      "cluster operations",
      "homelab operations",
      "release engineering",
    ],
    strongTags: [
      "gitops",
      "infrastructure",
      "operations",
      "recovery",
      "rollback",
    ],
    anchors: [
      "moving-a-live-cluster-to-a-new-subnet",
      "the-target-state-is-not-the-plan",
    ],
    overrides: ["gitops-cluster"],
    region: { x: 800, y: 185 },
  },
  {
    id: "organizational-practice",
    label: "Work, institutions, and accountability",
    summary:
      "How institutions form expertise, recognize contribution, allocate responsibility, and make decisions as work changes.",
    areas: ["career", "open source", "organizational systems"],
    strongTags: [
      "accountability",
      "career",
      "decision-making",
      "organizational-design",
    ],
    anchors: ["the-person-of-record", "the-candidate-produced-somewhere-else"],
    overrides: [],
    region: { x: 250, y: 465 },
  },
  {
    id: "physical-systems",
    label: "Physical systems, energy, and place",
    summary:
      "Energy, hardware, and household systems tested against physical and operational limits.",
    areas: ["energy systems", "hardware contracts"],
    strongTags: ["energy", "hardware", "heat-pumps", "hydropower", "off-grid"],
    anchors: ["size-the-spa-to-the-river", "nfc-tokens-pointing-at-a-manifest"],
    overrides: ["household-operating-platform"],
    region: { x: 560, y: 470 },
  },
  {
    id: "knowledge-editorial",
    label: "Knowledge systems and creative practice",
    summary:
      "Writing, publishing, media-making, and the systems used to create, preserve, verify, and retrieve their artifacts.",
    areas: ["creative tooling"],
    strongTags: ["authorship", "creative-tooling", "documentation", "writing"],
    anchors: [
      "a-personal-knowledge-system-that-happens-to-render-as-a-website",
      "the-wallpaper-is-a-build-artifact",
    ],
    overrides: [
      "a-personal-knowledge-system-that-happens-to-render-as-a-website",
      "why-i-publish-explore-prompts",
      "the-workshop-is-learning-my-accent",
      "the-embarrassment-is-mine",
    ],
    region: { x: 840, y: 465 },
  },
];
