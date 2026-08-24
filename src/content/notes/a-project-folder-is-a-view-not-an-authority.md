---
title: Treat project folders as views over authoritative state
role: operating
status: guiding
lifecycle: current
area: agent workflow
published: 2026-08-06
lastRevised: 2026-08-08
projects:
  - vuoro
relates:
  - authority-must-travel-with-the-action
  - the-coordinator-never-touches-the-repo
  - legibility-is-an-operating-property
draft: false
terms:
  - term: Vuoro
    definition:
      The public label for this family of small, separately owned agent-workflow
      tools.
  - term: sprintctl
    definition:
      The CLI and schema that own sprint work, dependencies, claims, and
      handoffs.
  - term: kctl
    definition:
      The read-only pipeline that turns reviewed sprint history into durable
      knowledge.
  - term: actionq
    definition:
      The PostgreSQL-backed queue that owns actions, sessions, claims, and
      outcomes.
  - term: auditctl
    definition:
      The tool that indexes audit events and emits portable daily evidence
      shards.
  - term: Appservice
    definition:
      The private GitOps repository that holds desired state, recovery rules,
      and operational evidence for the cluster.
tags:
  - agents
  - workflow
  - git
  - workspaces
  - authority
summary: >-
  A multi-repository project folder may assemble member worktrees, shared
  guidance and project context, but it must not acquire ownership of Git,
  backlog, execution or deployment state merely because every tool can see it.
explorePrompt: >-
  Use this note as a worked reference design, not a folder convention to copy.
  The transferable question is: when several authoritative systems are composed
  into one convenient workspace, how do you prevent the composition layer from
  silently becoming another authority? In this instantiation, a
  source-controlled project binding selects repository members and shared
  guidance, while generated materialization instances expose linked worktrees
  for a session. Git commits and refs remain repository-owned; work selection,
  queue execution, audit and deployment remain with their existing systems; the
  folder root has no Git identity; writable instances use unique branches and
  are destroyable only when clean. Apply the question to a multi-repository
  workspace, data-product workbench, incident room or agent environment you
  operate. Identify each underlying authority, what the composed view may cache
  or render, how identity and provenance are recorded, and which actions must be
  performed through a member or owning system rather than the view. Challenge
  the design where your workspace is itself the durable source. Produce an
  authority matrix, lifecycle rules and three tests that would expose accidental
  authority capture.
reference:
  purpose: operating-guidance
  discoverFor:
    - deciding what a multi-repository workspace folder is allowed to own
    - separating a generated working view from the systems that own state
  establishes:
    - that a materialized project folder is a view over existing authorities and
      durable change must land in the owning system
    - that unified navigation is the folder's benefit and is not a claim of
      ownership
  doesNotEstablish:
    - how any specific workspace tool implements binding or materialization
    - permissions or access policy for the receiving environment
  supplementWith:
    - the receiving repository's own ownership, branch, and deployment rules
---

A project folder may present several repositories as one working surface. It
must not become a new owner merely because it is the easiest place to stand.

In the Vuoro workspace model, a source-controlled project binding names the
member repositories, their roles, access modes, shared guidance and backlog
participation. A materialization instance turns that binding into a local folder
containing linked Git worktrees and resolved context for one work window.

The folder improves discovery. It does not own Git history, backlog state, queue
claims, deployment state or runtime truth.

That distinction is the rule:

> A project folder is a generated view over existing authorities. Any durable
> change must still land in the system that owns it.

## The folder is useful precisely because it looks unified

A multi-repository system has an ordinary navigation problem. Starting from a
flat directory of unrelated clones requires the operator or agent to know which
repository is the useful entrance, which other repositories participate, where
shared terminology lives, and which work system describes the current task.

A project view can answer those questions immediately:

```text
project instance/
  AGENTS.md
  project.context.json
  members/
    agentops/
    vuoro/
    sprintctl/
    kctl/
    auditctl/
    actionq/
```

One folder can expose the project shape, resolved guidance, repository roles and
the exact revisions currently available to the session. A shell, IDE or agent
can begin with “Vuoro” rather than first reconstructing Vuoro from seven
directory names.

That convenience creates the risk. The folder sits above every member, contains
a rendered project instruction file, and appears to be the place from which the
whole system can be controlled. Without an explicit boundary, it gradually
becomes a virtual monorepo whose ownership rules exist only in operator memory.

The view then starts collecting responsibilities:

- a generated context file becomes the presumed source of project truth;
- the folder root becomes an ambiguous Git or backlog identity;
- a helper called `sync` begins advancing repositories and regenerating context;
- session notes become permanent planning records;
- shared guidance overrides repository-owned safety rules;
- dispatch starts consuming whichever worktree happens to be present;
- deletion is treated as harmless because the folder was described as
  disposable.

Each step is locally convenient. Together they create a second control plane
with no clear owner.

## Keep the authorities separate

The project view should make existing authorities legible without absorbing
them.

| Concern                    | Authority                                        | What the project folder may do                                    |
| -------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| Repository history         | Commits and refs in each member repository       | Expose linked worktrees at recorded revisions                     |
| Project membership         | `project.toml` in the designated home repository | Materialize the declared member set and record its digest         |
| Repository instructions    | The owning repository                            | Render applicable guidance with provenance                        |
| Shared project guidance    | The home repository                              | Present it at project scope                                       |
| Work selection and backlog | Sprintctl and its repository identities          | Project relevant member backlogs for reads                        |
| Queue claims and execution | Actionq                                          | Supply context and member paths, not claim work itself            |
| Audit evidence             | The owning audit system                          | Reference evidence; never replace it with scratch files           |
| Deployment                 | Appservice and GitOps reconciliation             | Expose deployment references, not mutate runtime authority        |
| Runtime state              | The target service or cluster                    | Inspect through its interfaces; never infer truth from the folder |
| Session scratch            | The local instance                               | Hold temporary notes and outputs until promoted or discarded      |

The resulting design is intentionally uneventful. Adding a repository to the
view does not move its backlog, rewrite its release process, change its
deployment owner or grant every session write access to it.

A project is therefore not a loose alias for “all repositories that seem
related.” It is a reviewed binding with a home repository. A member has an
explicit relationship such as implementation, governance, planning authority,
execution authority, tooling or reference. It also has an access mode. Those
fields describe the view; they do not transfer the underlying authority.

This is the same distinction described more generally in
[Authority must travel with the action](/notes/authority-must-travel-with-the-action/):
location can make an action possible without making the location authoritative
for that action.

## Logical project and local instance are different objects

The logical project is durable and source controlled. A materialization instance
is one local realization of it.

```text
logical project
  project_id
  home repository
  member roles
  access declarations
  shared guidance
  backlog projection
        ↓ materialize
local instance
  instance_id
  binding commit and digest
  resolved context
  linked member worktrees
  local lease
  temporary session state
```

A project may have no active instances, one conventional instance, or several
task-specific instances. Separate instances are not forks of project truth. They
are concurrent views and work surfaces over the same reviewed binding.

The instance marker, rather than the folder name, carries identity. It records
the project and instance IDs, mode, binding source, binding commit, binding
digest and resolved context digest. A directory called `vuoro` is only a
convenience. Without the marker and provenance, it is just a directory with
excellent branding.

One instance activates one project binding. A repository may participate in
several logical projects, but the system does not merge every project's guidance
into one checkout. Different active contexts require different instances.

## The root has no repository identity

The project root is deliberately not a Git repository.

That removes a surprisingly large class of ambiguity. A command that requires
repository identity must run from a member worktree or receive an explicit
repository identifier. The root may supply project context, but it cannot
pretend that a multi-repository composition has one Git history.

For example, project-scoped backlog reads still begin from a member checkout:

```bash
cd <instance>/members/<home-repo>
sprintctl usage --context --project --json
sprintctl next-work --project --json --explain
```

The project context supplies the ordered union of participating backlog
repositories. The current member supplies an explicit backend repository
identity. Neither input is guessed from the folder name.

The same rule applies to Git operations. Normal Git commands update member
branches. The project materializer may create or inspect worktrees, but it does
not invent a project-wide commit, branch or merge operation.

A project view is not a monorepo emulator. If atomic cross-repository commits
are required, the project has discovered a different architectural problem.

## Read and write instances need different contracts

The initial instance modes are narrow:

- **shared-read** uses detached member worktrees at recorded commits for
  orientation and inspection;
- **exclusive-write** creates unique branches per instance and writable member.

Reference members remain detached and read-only even inside an exclusive-write
instance. Membership is not permission.

A writable instance also needs a lease because a unique branch does not stop two
processes from modifying the same filesystem concurrently. The current lease is
host-local and cooperative. It protects instance lifecycle operations such as
context regeneration, Git movement and destruction. It is not a distributed work
or authorization authority, and it must not be presented as one.

The branch and lease solve different problems:

```text
unique branch  -> separates durable Git history between instances
local lease    -> separates mutation of one materialized filesystem
Actionq claim  -> owns execution and settlement of queued work
```

Collapsing these into one “workspace lock” would make the project folder the
owner of work it only presents.

## Guidance is rendered, not annexed

Project-level guidance is valuable because an agent entering through any member
needs the shared terminology, member map and operating boundaries before
repository-specific instructions narrow the task.

Rendering that guidance does not grant the project file unlimited precedence.
The useful policy is semantic rather than merely positional:

| Guidance class                    | Resolution rule                            |
| --------------------------------- | ------------------------------------------ |
| Safety and authority restrictions | The most restrictive applicable rule wins  |
| Repository ownership              | The repository owner remains authoritative |
| Shared terminology                | Additive                                   |
| Commands and local paths          | The nearest applicable scope wins          |
| Project membership                | The active reviewed binding wins           |
| Secrets and credentials           | Never aggregated                           |

Textual render order cannot prove that two free-form instruction files agree.
The instance therefore records ordered source provenance and digests, and an
explain operation can show which file supplied each layer of context.

That evidence proves what the materializer rendered. It does not prove that
every agent harness discovers or interprets parent instructions identically.
Actual harness behavior remains something to test.

This is a recurring limit of composition systems: a trace can establish the
inputs and transformation without establishing every consumer's semantics.

## Derived does not mean disposable

The instance structure and generated context are derived. They can be rebuilt
from the project binding and member repositories.

A writable instance containing uncommitted edits is not disposable.

That qualification matters because “ephemeral workspace” often becomes
permission to use recursive deletion as lifecycle management. Git worktrees may
contain staged files, untracked files or commits that have not reached a
protected remote. Scratch may contain investigation evidence that has not yet
been promoted. Deleting the folder at that point loses real state even though
the folder was originally generated.

The safe term is:

> A materialization instance is destroyable only when clean.

Checked destruction must refuse at least:

- dirty, staged or untracked member work;
- commits not safely represented by the expected remote history;
- unexpected branches or detached writable members;
- an active lease;
- non-empty session scratch;
- unknown top-level paths;
- an identity marker that does not match the requested target.

Work intended to survive the instance must move to its owning system:

```text
source change       -> member repository
work decision       -> Sprintctl
queue consequence   -> Actionq
audit evidence      -> Auditctl or owning ledger
deployment change   -> Appservice
temporary notes     -> .session/ until promoted or discarded
```

The folder can be reconstructed. Uncommitted intent cannot.

## Context refresh must not move code

Another useful boundary is to separate context regeneration from Git movement.

Refreshing resolved guidance should use the instance's recorded inputs. It must
not fetch, merge, rebase, reset or silently advance member revisions. A session
asking “show me the current context for this instance” should not discover that
the request also changed the source it was reasoning about.

Similarly, advancing a clean member worktree is a Git operation with its own
preconditions and report. A helper may fetch and fast-forward where explicitly
allowed, while leaving dirty, ahead, diverged, detached or unexpected-branch
states unchanged.

The name matters. An all-purpose command called `sync` invites context, Git,
remote and project-definition changes to blur together. Separate verbs make the
effects reviewable:

```text
status            inspect without changing
refresh-context   regenerate context from recorded inputs
advance-member    change one member revision explicitly
materialize       create a new instance from a binding
destroy           remove a verified-clean instance
```

The exact command names may vary. Their effect boundaries should not.

## Exclusion is part of the operating model

A local project instance should normally be excluded from broad backup,
cross-host synchronization, repository discovery, dispatcher clone discovery and
IDE indexing.

The durable inputs already live in their owner repositories and systems. Backing
up generated worktrees duplicates Git data, captures local leases and scratch,
and risks restoring an instance whose worktree registrations no longer match the
host. Cross-host synchronization is worse: a Git worktree is not a portable
folder independent of its common Git directory.

Exclusion does not make the instance expendable while dirty. It removes the
derived structure from systems that would otherwise mistake it for durable
source.

It also has to be real at the relevant storage layer. A path exclusion in a file
backup tool does not prevent a parent filesystem snapshot or block-level volume
snapshot from retaining the bytes. Where that distinction matters, `_projects`
needs a separate dataset, subvolume or backing volume rather than increasingly
optimistic glob syntax.

## Validation

A project-folder implementation should be able to prove the following before it
is treated as a safe work surface:

1. The binding came from the declared home repository at a recorded clean
   commit, and its digest matches the instance marker.
2. Every member worktree is registered to the expected local Git common
   directory and is at the recorded revision.
3. Member role, access mode and effective filesystem permissions agree.
4. The root is not a Git repository and carries no ambiguous repository
   identity.
5. Resolved context has source-level provenance and a deterministic bundle
   digest.
6. The active instance contains one project binding, not an accidental merge of
   project contexts.
7. The exclusion policy names the actual instance root and is separately tested
   against each backup, synchronization, discovery and indexing mechanism that
   matters.
8. Checked destruction rejects every form of unpromoted state.
9. At least one real agent harness has demonstrated the intended guidance
   resolution rather than relying solely on the materializer's trace.

A preflight report can establish the local filesystem and Git facts. It cannot
prove that an external backup engine applies its policy, that an IDE respects an
exclusion, or that an agent harness interprets instructions correctly. Those are
separate consumers and require separate evidence.

## Failure handling

The boundary gives common failures uninteresting responses:

- **The binding changed:** create a new instance or explicitly refresh the
  binding. Do not silently advance the home member underneath an active session.
- **A member is dirty or ahead:** leave it unchanged and report the condition.
  Commit, review or recover it through the owning repository.
- **The context is stale:** regenerate context from recorded member revisions.
  Do not move code as a side effect.
- **Two writers need the same project:** create separate exclusive-write
  instances and branches. Do not share one writable folder.
- **A reference member needs modification:** change its declared access and
  rematerialize through reviewed project configuration. Do not remove the
  read-only bit by hand and call it exceptional.
- **The instance cannot be trusted:** preserve any uncommitted state, destroy
  the verified-clean remainder, and rebuild from the binding and durable
  authorities.
- **Scratch contains durable evidence:** promote it before teardown. A session
  directory is a staging area, not an audit ledger.

The rollback path for a broken materializer is equally plain: stop using the
project view and return to the canonical member checkouts and owner systems. The
composition layer should improve ergonomics without becoming necessary for Git,
planning, execution or deployment to remain intelligible.

## The boundary

A project folder earns its existence by making a multi-repository system easier
to enter and harder to misunderstand.

It fails when convenience changes ownership.

The durable project definition belongs in its home repository. Git identity
belongs to member commits and refs. Work, execution, audit, deployment and
runtime effects remain with their existing authorities. A local instance may
compose those systems, render their context and provide safe worktrees, but it
must remain reconstructable from them.

The view can be thrown away after its real state has been promoted.

The authorities must still be there when it is gone.
