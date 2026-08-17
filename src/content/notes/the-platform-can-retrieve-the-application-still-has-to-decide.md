---
title: The platform can retrieve; the application still has to decide
seoTitle: Why RAG plumbing is becoming weaker AI career proof
socialTitle: RAG is becoming plumbing. Acceptance is not.
role: synthesis
status: exploration
lifecycle: current
area: model evaluation
published: 2026-08-17
lastRevised: 2026-08-17
projects:
  - acceptance-lab
relates:
  - a-platform-capability-does-not-exist-all-at-once
  - measure-the-diagnosis-not-only-the-transcript
  - judge-agents-by-the-next-prompt
  - the-agent-is-not-the-application
  - authority-must-travel-with-the-action
draft: true
tags:
  - agents
  - evaluation
  - retrieval
  - rag
  - governance
  - career
summary: >-
  RAG, vector search, graph engines, and generic evaluation tooling are moving
  into managed platforms. The durable work is defining which evidence may
  count, what failure means, and when an agentic system is acceptable to ship.
explorePrompt: >-
  Use this note as a dated working model of an abstraction boundary moving up
  the AI application stack. The transferable question is which parts of an AI
  system are becoming purchasable platform capabilities and which decisions
  remain specific to the workflow, data, authority model, and risk. Apply that
  question to one system you operate or plan to build. Separate construction
  mechanics from diagnostic fluency, and generic evaluation infrastructure
  from the acceptance criteria, failure taxonomy, evidence requirements, and
  promotion decision the application owner must supply. Include at least one
  case where a technically correct output should still fail because it used a
  forbidden source, exceeded its authority, skipped verification, or could not
  produce a required receipt. End with a deliberately small competency slice
  for the commoditizing layer, a deeper project at the durable layer, and the
  observations that would falsify your allocation of effort.
---

I started with a sensible career checklist: build personal project experience
with RAG, a vector database, a graph database, a knowledge graph, and an
evaluation harness.

Within one discussion, the list started to look like a plan to gain experience
with the layer vendors were actively turning into a setting.

That does not make the technologies irrelevant. A field architect who cannot
explain chunk boundaries, hybrid retrieval, reranking, filtered vector search,
or multi-hop traversal will still get found out quickly. It changes what the
project should claim. A generic RAG repository may establish basic fluency. It
is increasingly weak as the main evidence that I can turn an AI capability into
a controlled business system.

The stronger project starts one layer higher.

## The abstraction boundary is already moving

The 2023 version of RAG had an obvious architecture diagram:

```text
documents
-> chunks
-> embeddings
-> vector database
-> top-k retrieval
-> prompt
-> answer
```

Every box looked like application work.

By August 2026, much of that path is available as platform behaviour. OpenAI's
[vector-store API](https://platform.openai.com/docs/api-reference/vector-stores-files)
accepts files, stores chunking configuration, and exposes the indexed content
to file-search tooling. Claude Projects can
[enable RAG automatically](https://support.anthropic.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)
when project knowledge outgrows the ordinary context path. Azure AI Search's
[agentic retrieval](https://learn.microsoft.com/en-us/azure/search/agentic-retrieval-how-to-retrieve)
can decompose a question, execute several searches, rerank results, and return
citations and execution metadata through one knowledge-base surface.

The implementation is not identical across those products, and none removes
the need to understand retrieval. The relevant change is ownership. Chunking,
indexing, query decomposition, reranking, and citation assembly are becoming
things an application can configure or invoke rather than necessarily build.

RAG does not disappear in that model. It becomes one context-acquisition
strategy available to an agent or application, alongside long context, live
queries, files, tools, structured memory, and ordinary database access.

That is a poor place to anchor a multi-year career distinction.

## The original list splits in two

The useful split is not between fashionable and unfashionable technology. It is
between capabilities a platform can provide generically and decisions that
only the application owner can make.

| Moving toward platform capability                             | Still specific to the application                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Default chunking and embedding pipelines                      | Which source is authoritative for this question                                             |
| Vector indexing and approximate-nearest-neighbour search      | Whether a relevant source is current, superseded, or out of jurisdiction                    |
| Standard lexical, vector, hybrid, and reranking paths         | Which actor may retrieve or act on which information                                        |
| Graph storage and traversal engines                           | What an entity, assertion, conflict, and valid-time edge mean in the domain                 |
| Generic traces, judges, score dashboards, and labeling queues | What counts as success, a critical miss, an acceptable refusal, or a release blocker        |
| Tool connection and delegated authentication protocols        | Whether the delegated action is within business authority and what evidence must survive it |

This is why “learn a graph database” and “learn knowledge graphs” are not the
same project. Neo4j, Postgres, or a managed graph service can store and traverse
edges. None decides whether two names refer to one legal entity, whether an
assertion was valid on the requested date, whether later evidence superseded it,
or whether a relationship came from a primary source or an extraction model.

The engine is increasingly purchasable. The model is still work.

The same applies to vector databases. Choosing pgvector, Qdrant, or a managed
index is usually an implementation decision. Understanding exact versus
approximate search, filtered recall, rebuild behaviour, and latency trade-offs
remains useful because those details explain failures. The product claim should
not be that I managed to stand one up.

## Abstraction removes construction before it removes diagnosis

A managed retrieval endpoint can return a poor answer for several materially
different reasons:

- the required document was never ingested;
- the right document was ingested but marked with the wrong permissions;
- a table or definition was split at a bad chunk boundary;
- the query used vocabulary that never matched the indexed wording;
- the first-stage retriever found the evidence and the reranker suppressed it;
- a superseded document was more semantically similar than the current one;
- the retrieval result was correct and the answerer ignored it;
- the answer was factually correct but used evidence the actor was not allowed
  to see.

A product can hide most of the construction and still expose all of those
failure classes. In fact, once the happy path becomes a checkbox, the remaining
work becomes disproportionately diagnostic. Someone has to identify whether the
problem belongs to corpus coverage, retrieval, authority, temporal semantics,
agent planning, generation, or the business rule itself.

That is directly relevant to field and forward-deployed architecture. The job
is less often to invent an index than to explain why a customer's apparently
working system cannot be promoted, then find the smallest change that makes the
claim defensible.

SQL did not become useless when databases and ORMs improved. Kubernetes did not
become irrelevant when managed control planes arrived. The scarce part moved
from assembling the ordinary path to diagnosing the awkward one. Retrieval is
following the same slightly impolite pattern.

## Evaluation is being abstracted too

The same correction applies to “build an evaluation harness.”

Current MLflow and Databricks surfaces already provide traces, evaluation
runs, datasets, human review, built-in judges, custom
[code-based scorers](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/custom-scorers),
and production monitoring. Anthropic's
[agent-evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
likewise treats the infrastructure as shared while putting most task design in
the hands of the product and domain teams closest to the requirement.

Building another generic score dashboard is therefore not obviously more
durable than building another vector store wrapper.

The part that resists abstraction is the denominator:

- the scenario bank that represents the real workflow;
- the facts or effects that must survive;
- the failures that are severe enough to block release;
- the sources that may and may not count;
- the required evidence for a conclusion;
- the threshold for correct refusal;
- the cost and latency envelope;
- the person or function authorized to accept the residual risk.

A vendor can host the run. It cannot discover those rules from the word
“groundedness.”

This was the useful residue from the Outctl experiments. The initial comparison
collapsed four claims into one result: mechanism, task quality, economics, and
execution authority. A stable reduction in model-visible output established the
mechanism. It did not establish an equally good diagnosis, lower total cost, or
identical execution identity. The harness was real; the acceptance model was
under-specified.

The next work should preserve those dimensions instead of replacing them with a
larger collection of generic scores.

## Agent trajectories make the gap larger

A question-answering system can often be evaluated from an input, retrieved
context, and final response. An agentic system leaves a longer object behind:

```text
request
-> context discovery
-> tool selection
-> intermediate observations
-> decision
-> effect
-> verification or recovery
-> final response
```

The final state can be correct while the run is unacceptable.

An agent may reach the requested result through a credential it should not have
used. It may retrieve a prohibited customer record, perform a write without the
required approval, skip post-change verification, produce no execution receipt,
or consume ten times the expected cost. It may also fail safely, recover
correctly, and deserve a better score than an agent that succeeded once through
luck.

That creates at least five evaluation surfaces:

| Surface    | Question                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Outcome    | Did the requested business state result?                                                        |
| Evidence   | Are the material claims and effects tied to receipts that support them?                         |
| Authority  | Were every source, tool, identity, and effect within the granted scope?                         |
| Trajectory | Did the agent take required steps, avoid forbidden ones, verify effects, and recover correctly? |
| Economics  | Was the result achieved inside the accepted time, token, and cost envelope?                     |

Authentication standards can improve the connection boundary. MCP's
[enterprise-managed authorization](https://blog.modelcontextprotocol.io/posts/enterprise-managed-auth/),
for example, gives organizations a standardized way to provision server access
through their identity provider. That is useful substrate. It still does not
decide whether an agent may approve a regulatory exception, whether the action
needs four-eyes review, or which evidence must be retained for the decision.

OAuth can establish who delegated a token. The application still owns what the
token is allowed to mean.

## Career proof should move up one layer

Current screening vocabulary will lag this abstraction boundary. Roles will
continue to ask for RAG, vector databases, knowledge graphs, and evals because
those are useful shorthand for a family of systems and failure modes. I should
be able to discuss each one without converting the interview into live remedial
training.

The mistake would be treating every checkbox as a flagship project.

A bounded competency slice is enough for the plumbing:

1. build one ordinary corpus pipeline;
2. compare lexical, vector, hybrid, and reranked retrieval;
3. measure recall at a small golden set;
4. inject a bad chunk boundary, terminology mismatch, and stale document;
5. state the corpus-size boundary where exact search stopped teaching anything
   about approximate indexes;
6. stop.

That establishes vocabulary and diagnostic contact with the mechanics. It does
not need a product name, a Kubernetes operator, or six months of ontological
self-discovery.

The deeper project should show that I can turn an increasingly capable platform
into a business system with explicit acceptance. One current OpenAI
[Forward Deployed Engineer role](https://openai.com/careers/forward-deployed-engineer-zurich-zurich-switzerland/)
describes success in terms of production adoption, measurable workflow impact,
and eval-driven feedback rather than expertise in one retrieval engine. That is
a dated job-market observation, not proof of a universal hiring rule, but it is
a much better description of the capability I want to demonstrate.

Personal work still cannot manufacture organizational receipts. It can provide
the reference design, vocabulary, failure model, and executable artifact needed
to earn one internally. The strongest outcome is not that a public repository
exists. It is that the repository becomes the basis for an evaluated internal
pilot with real domain owners and real promotion criteria.

## The next project is an acceptance record

The first implementation is called **Acceptance Lab** for now. That is a
directory name, not a request to found another platform.

The intended path is concrete rather than mystical:

```text
trace or observed run
-> bounded evidence record
-> scenario-specific evaluation
-> promotion, hold, rollback, or escalation policy
```

The first package implements the two middle steps and emits a promotion state.
It does not yet capture a live run or enforce a production release policy. That
keeps observability, evidence, evaluation, and policy connected without claiming
that one small local harness owns all four.

Its central record is a scenario:

```yaml
scenario:
  request: What should the agent accomplish?
  starting_state: What is true before it runs?
  expected_outcome: What facts or effects must result?
  authority: Which sources, tools, identities, and actions are allowed?
  required_evidence: What receipts must support the result?
  failure_rules: Which misses or violations block promotion?
  budgets: What latency and cost are acceptable?
```

A candidate run adds the actual answer, cited evidence, tool trajectory, effects,
verification, latency, and cost. Deterministic scorers evaluate requirements that
can be encoded mechanically. Model judges can later cover semantic criteria
that do not have a complete oracle, but they do not get to override hard
authority or evidence failures because they found the prose persuasive.

The initial package is deliberately small:

- append-only evaluation events in SQLite;
- a hash chain that makes edits to the event record visible;
- rebuildable run and score projections;
- deterministic scorer plugins;
- `PASS`, `CONDITIONAL`, and `FAIL` promotion states;
- Markdown and JSON reports;
- one retrieval scenario where a superseded document outranks the current one;
- one trajectory scenario where an agent reaches the effect without the required
  authority receipt or verification.

The retrieval example includes a naïve and an authority-aware candidate. The
point is not to prove that lexical retrieval needs rescuing. It is to show that
retrieval relevance and admissible authority are separate dimensions, and that
the second can be a hard gate even when the first looks good.

The trajectory example makes the corresponding operational distinction. A
correct final state does not wash the route taken to reach it.

The package does not yet execute live models, host a judge service, replace
MLflow, or become a Vuoro component. It accepts candidate records and evaluates
them. A live runner is the next useful boundary because it binds the evaluation
to observed tool calls and effects. Extraction into shared Vuoro infrastructure
should wait until a second genuine consumer needs the same event model. One
consumer is an implementation. Two may be a component. One plus enthusiasm is
just a framework pitch.

## The follow-on notes are clearer now

This note is the root of a track rather than the conclusion of one. The next
useful notes and project updates are already visible:

- **A correct result can still have a forbidden trajectory** — scoring tools,
  effects, receipts, verification, and recovery rather than only the answer.
- **The platform can run the scorer; the domain still owns the rubric** — who
  defines evaluation cases, thresholds, exceptions, and release authority.
- **Authorization is not business authority** — identity, delegation, policy,
  and the decision rights that remain outside protocol authentication.
- **The benchmark needs a promotion rule** — turning model, prompt, retriever,
  and harness comparisons into an adopt, hold, or rollback decision.
- **Acceptance Lab: first live candidate** — replacing fixture outputs with one
  traced agent workload and reporting what the initial schema failed to capture.

Those links should be added when the notes and project update exist, rather than
pre-creating dead routes because the roadmap looked tidy in Markdown.

## What would change this allocation

This is still a working market and architecture model.

I would put more effort back into retrieval infrastructure if the systems I
actually need to operate expose unsolved scale, filtered-recall, update, or
rebuild behaviour that the managed layer does not make legible. I would invest
more deeply in graph-engine expertise if traversal performance or graph-native
operations became the binding problem rather than the assertion model. I would
also revise the career view if the roles I am targeting consistently price deep
retrieval implementation above workflow deployment, evaluation ownership, and
production acceptance.

The next year should provide fairly direct evidence. Job descriptions, internal
AI programmes, and the failure modes of real pilots will show whether the value
continues moving upward or whether the abstraction leaks badly enough that the
lower layer remains a durable specialization.

Current confidence is high that tutorial RAG and vector-database setup are weak
flagship projects, moderate that trajectory acceptance and authority will become
larger architecture concerns, and deliberately low on which vendor surface will
own the generic harness.

RAG is still worth building once. The project claim should no longer be that I
built it.

The more durable claim is that I can say why a result was allowed to count, what
would make it fail, and who is authorized to ship it.
