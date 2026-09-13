---
title: A repository should not contain everything its agents know
role: synthesis
status: exploration
lifecycle: current
area: agent infrastructure
published: 2026-09-13
lastRevised: 2026-09-13
projects: []
relates:
  - a-project-folder-is-a-view-not-an-authority
  - the-agent-is-not-the-application
  - layering-you-cant-violate-by-accident
  - the-platform-can-retrieve-the-application-still-has-to-decide
  - the-context-window-is-not-the-continuity-boundary
  - simplicity-is-an-ambitious-property
draft: false
tags:
  - agents
  - context-management
  - documentation
  - workspaces
  - workflow
summary: >-
  Repositories should own local instructions and explicitly bind versioned
  enterprise, domain, workflow, and platform context whose lifecycles belong
  elsewhere.
explorePrompt: >-
  Use this note as a context-composition problem, not as a proposed manifest
  standard. The transferable question is who owns each piece of knowledge an
  agent needs, how independently it changes, and how a repository declares that
  it applies without copying it into local history or accepting silent global
  injection. This note's worked model separates enterprise, domain, work-type,
  platform, and repository layers; resolves explicit references to concrete
  versions for each run; and preserves different standing for mandatory policy,
  defaults, knowledge, available tools, and locally narrowable constraints.
  Apply the model to one repository. Inventory the external context currently
  copied, linked, or injected; name its owner and lifecycle; and design a
  binding record that makes both selection and resolved version inspectable.
  Include local exceptions, update review, unavailable sources, and conflicting
  layers. Challenge the model if reproducibility requires vendoring or if the
  repository genuinely owns the broader rule. Produce a layer table, conflict
  semantics, and one reconstruction test rather than choosing a file format.
reference:
  purpose: exploratory-hypothesis
  discoverFor:
    - shared agent instructions without copying global rules
    - versioning enterprise, domain, platform, and repository context together
  establishes:
    - a model for explicit context selection, version binding, conflict
      standing, and observable updates
  doesNotEstablish:
    - a standard manifest syntax or universal context registry
    - permission to override mandatory policy from a local repository
  supplementWith:
    - the repository's local instructions and the selected context providers'
      version and conflict contracts
---

The workspace that contains this site already composes two instruction layers. A
short repository `AGENTS.md` describes the public content boundary and local
validation; broader workstation guidance supplies credential, environment, and
workflow rules shared by many repositories. Skills add a third source when a
task calls for one.

That arrangement avoids copying the whole workstation manual into this
repository, but it creates a reconstruction question: which versions of those
external instructions governed a particular run? This workspace's nested and
managed instruction layers solve discovery. They do not by themselves provide a
versioned binding record.

The usual fix is copying. Add an `AGENTS.md`, paste the common rules, vendor a
specialist agent, and duplicate the relevant system architecture under `docs/`.
Everything is local and inspectable on the day it is added. Six months later,
the repository may be carrying a plausible but obsolete copy of guidance owned
somewhere else.

Keeping all shared material outside the repository and injecting the latest
version creates the opposite failure. The context stays current, but a run can
change without the repository changing, and a maintainer cannot reconstruct
which rules appeared.

The useful design question is therefore not where to put every file. It is how a
repository selects maintained context with independent ownership and lifecycle
without losing inspectability or local authority.

## The layers do not change together

A composed repository context may draw useful material from five levels:

```text
enterprise
  engineering practice · security · approved technology · shared tooling

domain
  shared concepts · common data · system landscape · regulation

work type
  software development · data engineering · analytics

platform
  deployment · observability · data conventions · supported interfaces

repository
  local architecture · tests · decisions · exceptions · commands
```

A repository may live for five years while enterprise guidance changes monthly.
A platform can replace its deployment method without changing the business
domain. A project can deliberately retain an exception after a default changes.

Flattening these layers into one local instruction tree hides their owners and
update rhythms. It also makes staleness difficult to distinguish from a
deliberate pin.

## Copying trades discovery for synchronization

A copied instruction is reliable in one important sense: Git records exactly
what the agent could read. The synchronization problem begins as soon as its
source changes.

Now the system has two possible truths. Automation can open update pull
requests, but it cannot answer the semantic questions by itself. Should every
repository accept the new version? Does a local design depend on the old rule?
Was the copy edited, pinned intentionally, or simply forgotten?

Copying can still be correct when the repository must own the material or build
without the external source. The problem is accidental vendoring: a duplicated
file looks local even though its lifecycle remains external.

## Invisible injection loses reconstruction

Always injecting current shared guidance removes stale copies. It also makes the
repository an incomplete account of its execution environment.

A run on Monday and the same run on Friday may receive different instructions
without any source change. Maintainers may not know which organization-wide
policy, skill, tool, or documentation source entered the session. Debugging a
decision then requires reconstructing an invisible configuration.

Currency without provenance is not enough. A run needs a record of both what the
repository selected and what concrete versions that selection resolved to.

## Treat context as an explicit composition

A repository can declare the maintained context that applies while retaining its
own local sources:

```yaml
context:
  - enterprise/engineering
  - enterprise/agent-baseline
  - domain/shared-language
  - platform/data
  - workflow/data-engineering

local:
  - ./AGENTS.md
  - ./docs/architecture.md
```

The syntax is incidental. The declaration makes selection inspectable; a
resolver binds each reference to a concrete version for the run. Shared material
can evolve independently, the project states what applies, and the execution can
still be reconstructed.

This extends
[the project-folder model](/notes/a-project-folder-is-a-view-not-an-authority/)
rather than repeating it. A composed folder is a view over repositories and work
systems that retain ownership of their state. A context binding answers a
different question: which maintained instructions and knowledge those
repositories supplied to one execution.

This is closer to dependency resolution than file discovery. It also introduces
familiar failure modes: an unavailable source, an incompatible update, a stale
pin, or a resolver that produced different bindings under the same inputs. The
binding record must make those failures visible rather than silently falling
back to whatever text happens to be nearby.

## Preserve the standing of each layer

Composition immediately raises a conflict question. “Local always wins” would
let a repository override an organizational security requirement with one line
of Markdown. “Enterprise always wins” would prevent legitimate architectural
exceptions and project-specific operating commands.

Different material needs different semantics:

- mandatory policy cannot be contradicted locally;
- a default can be replaced by a declared exception;
- knowledge contributes facts and evidence rather than commands;
- an advertised skill or tool adds an option, not an obligation;
- a local layer may narrow a mandatory permission but not broaden it.

Merging prose without preserving this standing creates an implicit cascade whose
output can run shell commands. The resolver should report a conflict it cannot
interpret, not settle it through document order.

## Make updates observable

Explicit composition lets old projects benefit from new shared guidance without
changing silently:

```text
enterprise/engineering
  bound: 4.8
  available: 4.9
  change: updated Python packaging guidance

platform/data
  bound: 7.2
  available: 8.0
  change: new deployment workflow
  compatibility: review required
```

Some sources may safely float within a compatible range. Others should require
review. A necessary pin remains visible as debt instead of disappearing into an
old copied file.

The repository still owns what is true because it is this repository: local
architecture, verification, decisions, exceptions, and operational commands. It
participates in a wider execution environment without pretending to own that
environment's history.

The first useful prototype is not a universal context registry. It is a binding
record that answers three questions after a run: what did this repository
select, which exact material was supplied, and what happened when two sources
disagreed? If those answers cannot be reconstructed, composition has only moved
the synchronization problem out of sight.
