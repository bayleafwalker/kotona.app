/**
 * @typedef {object} NoteLifecycleMetadata
 * @property {"current" | "superseded" | "archived" | "disproven"} lifecycle
 * @property {Date} [lifecycleChanged]
 * @property {string} [lifecycleReason]
 * @property {unknown[]} supersededBy
 * @property {unknown[]} invalidatedByProjects
 * @property {Date} published
 * @property {Date} lastRevised
 */

/**
 * Keep lifecycle invariants independent from rendering and content loading so
 * they can be tested with deliberately invalid states.
 *
 * @param {NoteLifecycleMetadata} note
 * @returns {{ path: string, message: string }[]}
 */
export function noteLifecycleIssues(note) {
  const issues = [];
  const nonCurrent = note.lifecycle !== "current";

  if (nonCurrent && !note.lifecycleChanged) {
    issues.push({
      path: "lifecycleChanged",
      message: "non-current notes require lifecycleChanged",
    });
  }

  if (nonCurrent && !note.lifecycleReason) {
    issues.push({
      path: "lifecycleReason",
      message: "non-current notes require lifecycleReason",
    });
  }

  if (note.lifecycle === "superseded" && note.supersededBy.length === 0) {
    issues.push({
      path: "supersededBy",
      message: "superseded notes require at least one successor",
    });
  }

  if (note.lifecycle === "current" && note.supersededBy.length > 0) {
    issues.push({
      path: "supersededBy",
      message: "current notes cannot declare a successor",
    });
  }

  if (
    note.lifecycle === "current" &&
    (note.lifecycleChanged ||
      note.lifecycleReason ||
      note.invalidatedByProjects.length > 0)
  ) {
    issues.push({
      path: "lifecycle",
      message: "current notes cannot declare invalidation metadata",
    });
  }

  if (note.published.getTime() > note.lastRevised.getTime()) {
    issues.push({
      path: "lastRevised",
      message: "lastRevised cannot be earlier than published",
    });
  }

  if (
    note.lifecycleChanged &&
    note.lifecycleChanged.getTime() > note.lastRevised.getTime()
  ) {
    issues.push({
      path: "lifecycleChanged",
      message: "lifecycleChanged cannot be later than lastRevised",
    });
  }

  return issues;
}
