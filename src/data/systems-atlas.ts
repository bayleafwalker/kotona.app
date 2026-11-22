import type {
  AtlasBasis,
  AtlasDefinition,
  AtlasNodeDefinition,
  AtlasReference,
} from "../lib/systems-atlas.ts";

const project = (id: string): AtlasReference => ({
  collection: "projects",
  id,
});
const note = (id: string): AtlasReference => ({ collection: "notes", id });
const source = (summary: string): AtlasBasis => ({ kind: "source", summary });
const proposal = (summary: string): AtlasBasis => ({
  kind: "proposal",
  summary,
});
const historical = (summary: string): AtlasBasis => ({
  kind: "historical",
  summary,
});
const node = (
  value: Omit<AtlasNodeDefinition, "links" | "lifecycle"> &
    Partial<Pick<AtlasNodeDefinition, "links" | "lifecycle">>,
): AtlasNodeDefinition => ({ lifecycle: "active", links: [], ...value });

/**
 * Public architectural declarations, not a discovered operational inventory.
 * Source references resolve through the existing published content collections.
 * Order within each region is intentional and supplies the stable map layout.
 */
export const atlasDefinition: AtlasDefinition = {
  title: "The systems atlas",
  summary:
    "Projects, tools, operating foundations, and the ideas connecting them. Follow a route, inspect a boundary, or open the notes behind it.",
  regions: [
    {
      id: "clients",
      title: "Clients & practice",
      summary: "Where work starts, and the guidance carried between sessions.",
    },
    {
      id: "work",
      title: "Work & records",
      summary:
        "Work ownership, execution contracts, knowledge, and retained results.",
    },
    {
      id: "execution",
      title: "Execution places",
      summary:
        "Hosted and owned environments, with their different access boundaries.",
    },
    {
      id: "experiments",
      title: "Experiments & making",
      summary:
        "Evaluation, service contracts, games, media, and working concepts.",
    },
    {
      id: "household",
      title: "Household systems",
      summary:
        "Long-lived meaning and decisions connected to devices and actions.",
    },
    {
      id: "infrastructure",
      title: "Operating foundations",
      summary:
        "Desired state, clusters, reconciliation, and recovery beyond a process.",
    },
  ],
  nodes: [
    node({
      id: "hosted-agents",
      title: "Hosted agent clients",
      summary:
        "Conversation and coding clients with provider-owned tool and network boundaries.",
      kind: "tool",
      region: "clients",
      stewardship: "used",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "The notes describe hosted clients and their reachability limits. They do not establish every current client integration.",
      ),
      sources: [
        note("reachability-is-architecture"),
        note("where-agent-tooling-fits"),
      ],
    }),
    node({
      id: "native-harnesses",
      title: "Native agent harnesses",
      summary:
        "Terminal agents and local coding harnesses that can execute a scoped attempt.",
      kind: "tool",
      region: "clients",
      stewardship: "used",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "The Vuoro account records one hosted-to-native handoff and distinguishes harness execution from work acceptance.",
      ),
      sources: [
        project("vuoro"),
        note("the-context-window-is-not-the-continuity-boundary"),
      ],
    }),
    node({
      id: "agentops",
      title: "AgentOps",
      summary:
        "Shared guidance, reporting, and plans that cross repository boundaries.",
      kind: "project",
      region: "clients",
      stewardship: "built",
      maturity: "implemented",
      basis: source(
        "The current project account identifies AgentOps as supporting guidance and plans; its former cockpit is historical.",
      ),
      sources: [
        project("vuoro"),
        note("the-coordinator-never-touches-the-repo"),
      ],
      links: [
        {
          label: "Repository",
          href: "https://github.com/bayleafwalker/agentops",
        },
      ],
    }),
    node({
      id: "vuoro",
      title: "Vuoro",
      summary:
        "Portable work, evidence, and acceptance across replaceable agents.",
      kind: "project",
      region: "work",
      stewardship: "built",
      maturity: "implemented",
      basis: source(
        "Local evaluation source and a dated handoff are public. Hosted operation remains unverified in the project record.",
      ),
      sources: [project("vuoro"), note("the-agent-is-not-the-application")],
      links: [
        { label: "Repository", href: "https://github.com/bayleafwalker/vuoro" },
        { label: "Interactive showcase", href: "https://demo.vuoro.cloud/" },
      ],
    }),
    node({
      id: "sprintctl",
      title: "Sprintctl",
      summary:
        "Owns the lifecycle of work and the decision that accepts its result.",
      kind: "component",
      region: "work",
      stewardship: "built",
      maturity: "implemented",
      basis: source(
        "The published composition assigns work and acceptance authority to Sprintctl, separately from an execution result.",
      ),
      sources: [project("vuoro")],
      links: [
        {
          label: "Repository",
          href: "https://github.com/bayleafwalker/sprintctl",
        },
      ],
    }),
    node({
      id: "sovite",
      title: "Sovite",
      summary: "Configured execution, admission, and access to results.",
      kind: "service",
      region: "work",
      stewardship: "built",
      maturity: "implemented",
      basis: source(
        "Source distinguishes standalone and workspace-hosted composition. Hosted end-to-end acceptance remains held.",
      ),
      sources: [
        project("vuoro"),
        note("why-production-access-changes-the-shape-of-agent-tooling"),
      ],
      links: [
        {
          label: "Repository",
          href: "https://github.com/bayleafwalker/sovite",
        },
      ],
    }),
    node({
      id: "vuoro-workspace",
      title: "Vuoro workspace",
      summary:
        "Reviewed knowledge and versioned artifacts retained across attempts.",
      kind: "component",
      region: "work",
      stewardship: "built",
      maturity: "implemented",
      basis: source(
        "The source account separates workspace-owned records from Git-authored documentation retrieval.",
      ),
      sources: [
        project("vuoro"),
        note("the-context-window-is-not-the-continuity-boundary"),
      ],
    }),
    node({
      id: "vuoro-knowledge",
      title: "Vuoro knowledge",
      summary:
        "Retrieval of Git-authored documentation bound to source revisions.",
      kind: "component",
      region: "work",
      stewardship: "built",
      maturity: "implemented",
      basis: source(
        "The project review exercised one local documentation search. Retrieval does not transfer workspace authority.",
      ),
      sources: [project("vuoro"), note("when-evidence-stops-applying")],
    }),
    node({
      id: "agentops-cockpit",
      title: "AgentOps cockpit",
      summary:
        "The earlier cockpit composition, retained to explain the changed ownership model.",
      kind: "component",
      region: "work",
      stewardship: "built",
      lifecycle: "retired",
      maturity: "historical",
      basis: historical(
        "The current Vuoro record says the former cockpit source was removed. Earlier operating evidence keeps its original dates.",
      ),
      sources: [project("vuoro")],
    }),
    node({
      id: "hosted-execution",
      title: "Hosted execution",
      summary:
        "Provider-managed execution with its own network and tool boundaries.",
      kind: "environment",
      region: "execution",
      stewardship: "used",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "The reachability record describes hosted runtimes and incomplete access to coordination services; it is not a current placement inventory.",
      ),
      sources: [note("reachability-is-architecture"), project("vuoro")],
    }),
    node({
      id: "isolated-workspaces",
      title: "Isolated workspaces",
      summary:
        "A proposed place for independent attempts with bounded context and access.",
      kind: "environment",
      region: "execution",
      stewardship: "explored",
      maturity: "concept",
      basis: proposal(
        "A conceptual execution option. The map does not claim a particular host, installation, or workload placement.",
      ),
      sources: [note("the-context-window-is-not-the-continuity-boundary")],
    }),
    node({
      id: "local-inference",
      title: "Local inference",
      summary:
        "An owned compute option for experiments and independently running sessions.",
      kind: "environment",
      region: "execution",
      stewardship: "explored",
      maturity: "concept",
      basis: proposal(
        "A placement option introduced in this map. Hardware inventory and current serving state are outside its scope.",
      ),
      sources: [],
    }),
    node({
      id: "homelab-analytics",
      title: "Homelab Analytics",
      summary:
        "Household meaning, scenarios, policies, and decisions in one semantic model.",
      kind: "project",
      region: "household",
      stewardship: "built",
      maturity: "implemented",
      basis: source(
        "The project record describes implemented source slices. Current household inputs and realized outcomes remain unverified.",
      ),
      sources: [
        project("household-operating-platform"),
        note("layering-you-cant-violate-by-accident"),
      ],
      links: [
        {
          label: "Repository",
          href: "https://github.com/bayleafwalker/homelab-analytics",
        },
        {
          label: "Detailed system map",
          href: "https://bayleafwalker.github.io/homelab-analytics/",
        },
      ],
    }),
    node({
      id: "home-assistant",
      title: "Home Assistant",
      summary: "Device state, household interfaces, and actuation at the edge.",
      kind: "service",
      region: "household",
      stewardship: "operated",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "The household platform names Home Assistant as its reference adapter. The published architecture does not renew operational observations.",
      ),
      sources: [project("household-operating-platform")],
    }),
    node({
      id: "household-agent-interface",
      title: "Household agent interface",
      summary: "Publication-backed retrieval and auditable action proposals.",
      kind: "interface",
      region: "household",
      stewardship: "built",
      maturity: "implemented",
      basis: source(
        "The project review describes narrow MCP tools and a shared proposal queue. Approval remains on the action path.",
      ),
      sources: [project("household-operating-platform")],
    }),
    node({
      id: "postgres",
      title: "PostgreSQL",
      summary:
        "The household platform's canonical shared operational and reporting store.",
      kind: "service",
      region: "household",
      stewardship: "operated",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "This names a logical storage role from the project architecture. It does not identify a live database instance.",
      ),
      sources: [project("household-operating-platform")],
    }),
    node({
      id: "appservice",
      title: "Appservice",
      summary:
        "Desired state and operating procedures for the homelab cluster.",
      kind: "project",
      region: "infrastructure",
      stewardship: "built",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "The public record describes repository responsibilities and dated recovery evidence. Private manifests remain outside this map.",
      ),
      sources: [
        project("gitops-cluster"),
        note("the-target-state-is-not-the-plan"),
      ],
    }),
    node({
      id: "talos-cluster",
      title: "Talos / Kubernetes",
      summary:
        "The cluster environment described by the operations repository.",
      kind: "environment",
      region: "infrastructure",
      stewardship: "operated",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "The operations account describes the cluster's architecture. Current health, installed versions, and individual service placements are not asserted.",
      ),
      sources: [
        project("gitops-cluster"),
        note("moving-a-live-cluster-to-a-new-subnet"),
      ],
    }),
    node({
      id: "flux",
      title: "Flux reconciliation",
      summary: "Carries declared cluster state from Git into reconciliation.",
      kind: "service",
      region: "infrastructure",
      stewardship: "operated",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "Flux is named in the repository's documented reconciliation model. Live agreement with Git requires a separate observation.",
      ),
      sources: [
        project("gitops-cluster"),
        note("the-node-remembers-what-git-does-not"),
      ],
    }),
    node({
      id: "recovery-storage",
      title: "Recovery storage",
      summary:
        "External snapshots and retained application data needed after failure.",
      kind: "environment",
      region: "infrastructure",
      stewardship: "operated",
      lifecycle: "maintained",
      maturity: "documented",
      basis: source(
        "The public record separates application data from control-plane snapshots and keeps the July restore evidence historical.",
      ),
      sources: [project("gitops-cluster"), note("keep-a-neglect-ledger")],
    }),
    node({
      id: "acceptance-lab",
      title: "Acceptance Lab",
      summary: "Executable promotion checks over bounded candidate evidence.",
      kind: "project",
      region: "experiments",
      stewardship: "built",
      maturity: "prototype",
      basis: source(
        "A runnable prototype with one captured public-source review. The record does not establish a deployed Vuoro integration.",
      ),
      sources: [
        project("acceptance-lab"),
        note("the-scorer-never-saw-the-changed-bytes"),
      ],
      links: [
        {
          label: "Repository",
          href: "https://github.com/bayleafwalker/acceptance-lab",
        },
      ],
    }),
    node({
      id: "box",
      title: "Box",
      summary:
        "A small service kernel with explicit party, catalog, and transaction contracts.",
      kind: "project",
      region: "experiments",
      stewardship: "built",
      maturity: "scaffold",
      basis: source(
        "The public record establishes a Phase 0 contract scaffold. A working service runtime remains a separate proof.",
      ),
      sources: [project("contract-first-box")],
      links: [
        { label: "Repository", href: "https://github.com/bayleafwalker/box" },
      ],
    }),
    node({
      id: "listening-rooms",
      title: "Listening rooms",
      summary:
        "A working concept for shared listening, room templates, music sources, and optional banter.",
      kind: "concept",
      region: "experiments",
      stewardship: "explored",
      maturity: "concept",
      basis: proposal(
        "A concept introduced with this atlas. Client access, playback ownership, and room synchronization remain design questions.",
      ),
      sources: [],
    }),
    node({
      id: "game-ai",
      title: "Game AI experiments",
      summary:
        "Replayable games for testing which decisions belong to models, learned selectors, or code.",
      kind: "project",
      region: "experiments",
      stewardship: "built",
      maturity: "prototype",
      basis: source(
        "The published exploration describes the game-AI work and its proposed contests. It does not establish a generally superior decision architecture.",
      ),
      sources: [
        note("intelligence-has-a-lifecycle"),
        note("the-fallback-played-the-games"),
      ],
    }),
    node({
      id: "world-window",
      title: "World-Window",
      summary:
        "Generated ambient media with source, manifests, receipts, and explicit promotion boundaries.",
      kind: "project",
      region: "experiments",
      stewardship: "built",
      maturity: "prototype",
      basis: source(
        "The media case records an unpromoted pipeline proof. Retained hashes establish byte identity, not media availability or full reproducibility.",
      ),
      sources: [
        note("the-wallpaper-is-a-build-artifact"),
        note("nfc-tokens-pointing-at-a-manifest"),
      ],
    }),
    node({
      id: "outctl",
      title: "Outctl",
      summary:
        "A retired experiment whose questions about reusable interpretations remain worth examining.",
      kind: "project",
      region: "experiments",
      stewardship: "built",
      lifecycle: "retired",
      maturity: "historical",
      basis: historical(
        "The public note explicitly retains Outctl's retirement. Its surviving question does not prescribe reviving the tool.",
      ),
      sources: [note("the-next-outctl-experiment-should-not-use-outctl")],
    }),
  ],
  edges: [
    {
      id: "agentops-vuoro",
      from: "agentops",
      to: "vuoro",
      label: "Shared practice",
      kind: "technical",
      state: "documented",
      summary:
        "Shared guidance and plans support the composed workflow; AgentOps does not become its runtime owner.",
      sources: [
        project("vuoro"),
        note("the-coordinator-never-touches-the-repo"),
      ],
    },
    {
      id: "vuoro-sprintctl",
      from: "vuoro",
      to: "sprintctl",
      label: "Work & acceptance",
      kind: "technical",
      state: "documented",
      summary:
        "Vuoro composes the work owner's contracts. A finished attempt remains distinct from an accepted work item.",
      interface: {
        purpose:
          "Create, reserve, and settle work through its owning contract.",
        caller:
          "A caller using the Vuoro composition and released Sprintctl adapter.",
        payload:
          "Work identity, dependencies, release reservation, artifact references, and required checks.",
        outcome:
          "The work owner may accept the result and unblock dependent work.",
        authority:
          "Sprintctl owns work lifecycle and acceptance; a worker result cannot replace that decision.",
      },
      sources: [
        project("vuoro"),
        note("the-work-between-the-ticket-and-the-agent"),
      ],
    },
    {
      id: "vuoro-sovite",
      from: "vuoro",
      to: "sovite",
      label: "Execution contract",
      kind: "technical",
      state: "documented",
      summary:
        "Configured execution is owned separately from work acceptance. The source composition has qualification limits.",
      interface: {
        purpose: "Admit a configured execution and expose its result.",
        caller: "The configured caller of Sovite's execution service.",
        payload:
          "Execution configuration, admission basis, and result references.",
        outcome:
          "An execution result becomes available; work acceptance remains a separate event.",
        authority:
          "Sovite owns admission and result access. Hosted end-to-end acceptance is not established by the published source review.",
      },
      sources: [
        project("vuoro"),
        note("why-production-access-changes-the-shape-of-agent-tooling"),
      ],
    },
    {
      id: "vuoro-native",
      from: "vuoro",
      to: "native-harnesses",
      label: "Harness execution",
      kind: "technical",
      state: "documented",
      summary:
        "Native harnesses are another execution path in the published composition, with one bounded continuation case.",
      sources: [
        project("vuoro"),
        note("the-context-window-is-not-the-continuity-boundary"),
      ],
    },
    {
      id: "vuoro-workspace-records",
      from: "vuoro",
      to: "vuoro-workspace",
      label: "Retained records",
      kind: "technical",
      state: "documented",
      summary:
        "Reviewed knowledge and versioned artifacts have a workspace owner beyond an individual attempt.",
      sources: [project("vuoro")],
    },
    {
      id: "vuoro-knowledge-retrieval",
      from: "vuoro",
      to: "vuoro-knowledge",
      label: "Documentation retrieval",
      kind: "technical",
      state: "documented",
      summary:
        "Documentation retrieval identifies Git-authored sources and the revisions returned.",
      interface: {
        purpose:
          "Find documentation while retaining its exact source revision.",
        caller: "A documentation consumer using vuoro-knowledge.",
        payload:
          "A search query and retrieved document references bound to Git revisions.",
        outcome: "A caller can inspect which source supported the answer.",
        authority:
          "Retrieval does not confer workspace ownership or decide whether the source applies to a new action.",
      },
      sources: [project("vuoro"), note("when-evidence-stops-applying")],
    },
    {
      id: "clients-work-access",
      from: "hosted-agents",
      to: "vuoro",
      label: "Client access option",
      kind: "technical",
      state: "proposed",
      summary:
        "A client could reach work through a supported interface. The map does not assert that every hosted client can reach the current service.",
      sources: [note("reachability-is-architecture")],
    },
    {
      id: "hosted-placement",
      from: "sovite",
      to: "hosted-execution",
      label: "Placement option",
      kind: "technical",
      state: "proposed",
      summary:
        "A conceptual deployment choice, pending the particular provider, access boundary, and execution qualification.",
      sources: [project("vuoro"), note("reachability-is-architecture")],
    },
    {
      id: "isolated-placement",
      from: "native-harnesses",
      to: "isolated-workspaces",
      label: "Workspace option",
      kind: "technical",
      state: "proposed",
      summary:
        "An owned workspace can bound an attempt's context and access; no current host placement is claimed here.",
      sources: [note("the-context-window-is-not-the-continuity-boundary")],
    },
    {
      id: "local-compute-option",
      from: "isolated-workspaces",
      to: "local-inference",
      label: "Compute option",
      kind: "technical",
      state: "proposed",
      summary:
        "A proposed local inference path for an independent workspace, with the actual serving interface still to be selected.",
      sources: [],
    },
    {
      id: "household-device-actions",
      from: "homelab-analytics",
      to: "home-assistant",
      label: "Device bridge",
      kind: "technical",
      state: "documented",
      summary:
        "The platform reads device state and publishes synthetic entities and approved actions through its Home Assistant adapter.",
      interface: {
        purpose: "Connect household decisions to device state and actuation.",
        caller: "Homelab Analytics' Home Assistant adapter.",
        payload:
          "Device state inward; synthetic entities and approved actions outward.",
        outcome:
          "Home Assistant remains the device-facing runtime while the platform retains long-lived meaning and decisions.",
        authority:
          "Approval remains on the route to action. The public account does not establish a current installed household outcome.",
      },
      sources: [project("household-operating-platform")],
    },
    {
      id: "household-mcp",
      from: "homelab-analytics",
      to: "household-agent-interface",
      label: "Retrieval & proposals",
      kind: "technical",
      state: "documented",
      summary:
        "A narrow agent-facing surface exposes published meaning and creates auditable proposals.",
      interface: {
        purpose:
          "Retrieve publication-backed household facts and propose an action.",
        caller: "An authorized consumer of the platform's narrow MCP tools.",
        payload:
          "Publication references, retrieved facts, and action proposals in a shared queue.",
        outcome:
          "The consumer can inspect published meaning and leave a proposal for the approval path.",
        authority:
          "A proposal has no execution authority by itself; approval is required for action.",
      },
      sources: [project("household-operating-platform")],
    },
    {
      id: "household-postgres",
      from: "homelab-analytics",
      to: "postgres",
      label: "Shared persistence",
      kind: "technical",
      state: "documented",
      summary:
        "PostgreSQL is the canonical shared operational and published-reporting store in the source architecture.",
      sources: [project("household-operating-platform")],
    },
    {
      id: "appservice-flux",
      from: "appservice",
      to: "flux",
      label: "Declares desired state",
      kind: "technical",
      state: "documented",
      summary:
        "The operations repository supplies the desired-state definitions used by reconciliation.",
      sources: [project("gitops-cluster")],
    },
    {
      id: "flux-cluster",
      from: "flux",
      to: "talos-cluster",
      label: "Reconciles workloads",
      kind: "technical",
      state: "documented",
      summary:
        "Flux is the documented reconciliation layer for cluster workload state.",
      interface: {
        purpose: "Apply declared workload state through reconciliation.",
        caller: "The configured Flux controllers.",
        payload:
          "Versioned cluster configuration and controller reconciliation results.",
        outcome:
          "Declared changes can converge through the cluster's reconciliation path.",
        authority:
          "Repository state describes intent; live reconciliation and host-local state need their own observations.",
      },
      sources: [
        project("gitops-cluster"),
        note("the-node-remembers-what-git-does-not"),
      ],
    },
    {
      id: "appservice-recovery",
      from: "appservice",
      to: "recovery-storage",
      label: "Recovery contract",
      kind: "technical",
      state: "documented",
      summary:
        "Operating procedures distinguish application data, control-plane snapshots, retention, and independently checked recovery.",
      interface: {
        purpose: "Retain and verify the material required for recovery.",
        caller:
          "The declared backup procedures and independently scoped recovery checks.",
        payload:
          "Application backups, encrypted control-plane snapshots, and dated verification records.",
        outcome:
          "A dated record can establish which retrieval and restore steps were checked.",
        authority:
          "An old drill does not establish fresh backups or today's ability to perform a production restore.",
      },
      sources: [project("gitops-cluster"), note("keep-a-neglect-ledger")],
    },
    {
      id: "household-box",
      from: "homelab-analytics",
      to: "box",
      label: "Informs the design",
      kind: "conceptual",
      state: "documented",
      summary:
        "Box generalizes part of the household-platform work into a smaller contract-first service-kernel experiment.",
      sources: [
        project("contract-first-box"),
        project("household-operating-platform"),
      ],
    },
    {
      id: "game-evaluation",
      from: "game-ai",
      to: "acceptance-lab",
      label: "Replayable checks",
      kind: "conceptual",
      state: "proposed",
      summary:
        "A reading connection between replayable game contests and bounded promotion checks. The projects do not acquire a runtime dependency through this analogy.",
      sources: [
        note("intelligence-has-a-lifecycle"),
        project("acceptance-lab"),
      ],
    },
    {
      id: "media-records",
      from: "world-window",
      to: "vuoro-workspace",
      label: "Retained artifacts",
      kind: "conceptual",
      state: "proposed",
      summary:
        "Both areas raise the question of what must survive after an attempt. This is an authored conceptual connection, not an implemented media integration.",
      sources: [note("the-wallpaper-is-a-build-artifact"), project("vuoro")],
    },
    {
      id: "cockpit-history",
      from: "agentops-cockpit",
      to: "vuoro",
      label: "Earlier composition",
      kind: "historical",
      state: "historical",
      summary:
        "The former cockpit account precedes the current composition with separately owned work, workspace, and execution contracts.",
      sources: [project("vuoro")],
    },
  ],
  routes: [
    {
      id: "accepted-work",
      title: "From attempt to accepted work",
      question: "How does agent work become accepted?",
      summary:
        "Follow the documented owners of work, execution, and retained results. The route explains source architecture; installed workflow qualification remains separate.",
      nodeIds: [
        "vuoro",
        "sprintctl",
        "sovite",
        "native-harnesses",
        "vuoro-workspace",
        "vuoro-knowledge",
      ],
      edgeIds: [
        "vuoro-sprintctl",
        "vuoro-sovite",
        "vuoro-native",
        "vuoro-workspace-records",
        "vuoro-knowledge-retrieval",
      ],
      includeHistory: false,
      steps: [
        {
          nodeId: "vuoro",
          title: "Keep the work portable",
          summary:
            "The composition keeps work identity and retained evidence beyond one agent.",
        },
        {
          nodeId: "sprintctl",
          title: "Name the work owner",
          summary:
            "Sprintctl reserves and settles work through its own contracts.",
        },
        {
          nodeId: "sovite",
          title: "Separate execution",
          summary:
            "An execution result is available through its execution owner; it does not settle the work.",
        },
        {
          nodeId: "vuoro-workspace",
          title: "Retain what a successor needs",
          summary:
            "Reviewed knowledge and versioned artifacts remain retrievable across attempts.",
        },
        {
          nodeId: "sprintctl",
          title: "Accept through the work contract",
          summary:
            "Required checks and the owning decision govern whether dependent work can proceed.",
        },
      ],
    },
    {
      id: "household-operation",
      title: "From household meaning to action",
      question: "What connects a household decision to a device?",
      summary:
        "Trace the household platform's logical interfaces, then inspect the separately documented operating foundations. No particular cluster placement is implied.",
      nodeIds: [
        "homelab-analytics",
        "household-agent-interface",
        "postgres",
        "home-assistant",
        "appservice",
        "flux",
        "talos-cluster",
        "recovery-storage",
      ],
      edgeIds: [
        "household-mcp",
        "household-postgres",
        "household-device-actions",
        "appservice-flux",
        "flux-cluster",
        "appservice-recovery",
      ],
      includeHistory: false,
      steps: [
        {
          nodeId: "homelab-analytics",
          title: "Give data long-lived meaning",
          summary:
            "Household views, scenarios, and policies share one semantic model.",
        },
        {
          nodeId: "household-agent-interface",
          title: "Retrieve or propose",
          summary:
            "Agent tools expose publication-backed information and a proposal queue.",
        },
        {
          nodeId: "home-assistant",
          title: "Keep device control at the edge",
          summary:
            "Approved actions reach Home Assistant through the device bridge.",
        },
        {
          nodeId: "appservice",
          title: "Inspect the operating foundations",
          summary:
            "The separate operations record describes desired state and the recovery model without assigning this service to a live host.",
        },
        {
          nodeId: "recovery-storage",
          title: "Ask what survives failure",
          summary:
            "Recovery needs retained data and fresh checks; a source diagram cannot establish either.",
        },
      ],
    },
    {
      id: "surviving-ideas",
      title: "Ideas that outlive an implementation",
      question: "Where did an idea go, and what was left behind?",
      summary:
        "Follow a documented design influence, compare two kinds of evaluation, and revisit a retired experiment. Conceptual lines describe reasoning rather than runtime calls.",
      nodeIds: [
        "homelab-analytics",
        "box",
        "game-ai",
        "acceptance-lab",
        "world-window",
        "vuoro-workspace",
        "outctl",
        "agentops-cockpit",
        "vuoro",
      ],
      edgeIds: [
        "household-box",
        "game-evaluation",
        "media-records",
        "cockpit-history",
      ],
      includeHistory: true,
      steps: [
        {
          nodeId: "box",
          title: "Extract a smaller architectural question",
          summary:
            "Box carries part of the household-platform work into a contract-first service scaffold.",
        },
        {
          nodeId: "game-ai",
          title: "Test decisions where replay is cheap",
          summary:
            "The game-AI exploration asks which decisions can become learned behavior or ordinary code.",
        },
        {
          nodeId: "world-window",
          title: "Keep the artifact's identity",
          summary:
            "The media experiment separates retained hashes from the ability to recover or reproduce the bytes.",
        },
        {
          nodeId: "outctl",
          title: "Keep the question after retiring the tool",
          summary:
            "Outctl stays retired while its note examines whether interpretations can be reused without displacing their sources.",
        },
        {
          nodeId: "agentops-cockpit",
          title: "Read the earlier composition",
          summary:
            "The old cockpit helps explain why today's contracts have separate owners.",
        },
      ],
    },
  ],
};
