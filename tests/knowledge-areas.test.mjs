import assert from "node:assert/strict";
import test from "node:test";

import { knowledgeAreas } from "../src/data/knowledge-areas.ts";
import { knowledgeClusters } from "../src/data/knowledge-clusters.ts";

test("knowledge areas are a unique controlled vocabulary", () => {
  assert.equal(new Set(knowledgeAreas).size, knowledgeAreas.length);
  assert.ok(knowledgeAreas.includes("organizational systems"));
  assert.equal(knowledgeAreas.includes("organizational-systems"), false);
});

test("cluster area rules use the controlled vocabulary", () => {
  for (const cluster of knowledgeClusters) {
    for (const area of cluster.areas) {
      assert.ok(
        knowledgeAreas.includes(area),
        `${cluster.id} references unknown area ${area}`,
      );
    }
  }
});

test("reviewed atlas territory labels and deliberate memberships stay stable", () => {
  const clusters = new Map(
    knowledgeClusters.map((cluster) => [cluster.id, cluster]),
  );
  const organizational = clusters.get("organizational-practice");
  const creative = clusters.get("knowledge-editorial");

  assert.equal(organizational?.label, "Work, institutions, and accountability");
  assert.deepEqual(organizational?.anchors, [
    "the-person-of-record",
    "the-candidate-produced-somewhere-else",
  ]);
  assert.equal(creative?.label, "Knowledge systems and creative practice");
  assert.deepEqual(creative?.anchors, [
    "a-personal-knowledge-system-that-happens-to-render-as-a-website",
    "the-wallpaper-is-a-build-artifact",
  ]);
  assert.ok(creative?.overrides.includes("the-workshop-is-learning-my-accent"));
  assert.ok(creative?.overrides.includes("the-embarrassment-is-mine"));
  assert.equal(creative?.overrides.includes("the-ref-nobody-adds"), false);
});
