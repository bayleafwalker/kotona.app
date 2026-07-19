export const buildRevision =
  typeof __BUILD_REVISION__ === "undefined" ? "unknown" : __BUILD_REVISION__;

export function getBuildRevisionLink() {
  return /^[0-9a-f]{40}$/i.test(buildRevision)
    ? {
        label: `Build ${buildRevision.slice(0, 12)}`,
        href: `https://github.com/bayleafwalker/kotona.app/commit/${buildRevision}`,
      }
    : { label: "Build unknown", href: null };
}
