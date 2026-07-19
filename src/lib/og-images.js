function safeEntryId(id) {
  return id.replace(/[^a-z0-9_-]+/gi, "-");
}

export function generatedOgImagePath(collection, id) {
  return `/og/generated/${collection}-${safeEntryId(id)}.png`;
}
