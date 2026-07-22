/**
 * @typedef {object} EntryPointNote
 * @property {string} id
 * @property {object} data
 * @property {string} data.title
 * @property {"guiding" | "prospective" | "exploration" | "archival"} data.status
 * @property {"current" | "superseded" | "archived" | "disproven"} data.lifecycle
 * @property {{ id: string }[]} data.relates
 */

/**
 * Rank notes as homepage entry points from the note graph itself instead of
 * a hand-maintained list, so the ranking cannot drift from what `relates`
 * actually shows once notes are added, revised, or superseded.
 *
 * A superseded, archived, or disproven note is never eligible -- a reader's
 * first stop should never need a lifecycle caveat. Within current notes,
 * editorial priority (`status: guiding`) ranks above link weight, and weight
 * (the count of distinct current notes a note references or is referenced by)
 * breaks ties within status. Historical decomposition must not keep steering a
 * reader toward a note after lifecycle succession has retired it.
 *
 * @template {EntryPointNote} T
 * @param {T[]} entries
 * @returns {T[]}
 */
export function rankEntryPoints(entries) {
  const neighborIds = new Map();
  const currentEntries = entries.filter(
    (entry) => entry.data.lifecycle === "current",
  );

  const neighborsFor = (id) => {
    let set = neighborIds.get(id);
    if (!set) {
      set = new Set();
      neighborIds.set(id, set);
    }
    return set;
  };

  for (const entry of currentEntries) {
    for (const related of entry.data.relates) {
      neighborsFor(entry.id).add(related.id);
      neighborsFor(related.id).add(entry.id);
    }
  }

  return currentEntries.sort((left, right) => {
    const leftGuiding = left.data.status === "guiding" ? 0 : 1;
    const rightGuiding = right.data.status === "guiding" ? 0 : 1;

    if (leftGuiding !== rightGuiding) {
      return leftGuiding - rightGuiding;
    }

    const leftWeight = neighborIds.get(left.id)?.size ?? 0;
    const rightWeight = neighborIds.get(right.id)?.size ?? 0;

    if (leftWeight !== rightWeight) {
      return rightWeight - leftWeight;
    }

    return left.data.title.localeCompare(right.data.title);
  });
}
