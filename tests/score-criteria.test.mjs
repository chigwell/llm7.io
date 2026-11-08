import test from "node:test";
import assert from "node:assert/strict";
import { SCORE_REQUIREMENTS, SCORE_SETS, meetsRequirement, scoreSetFor } from "../lib/models/score-criteria.js";

test("every score set has 30 unique criteria in known groups with known requirements", () => {
  for (const [type, set] of Object.entries(SCORE_SETS)) {
    const groups = new Set(set.groups.map((group) => group.key));
    assert.equal(set.criteria.length, 30, type);
    assert.equal(new Set(set.criteria.map((criterion) => criterion.key)).size, 30, type);
    for (const criterion of set.criteria) {
      assert.ok(groups.has(criterion.group), `${type}.${criterion.key} group`);
      assert.ok(!criterion.requires || SCORE_REQUIREMENTS[criterion.requires], `${type}.${criterion.key} requires`);
    }
  }
});

test("image editing criteria apply only to models that accept reference images", () => {
  const criterion = SCORE_SETS.image.criteria.find((item) => item.key === "multi_reference");
  const model = (capabilities) => ({ model_type: "image", modalities: { input: ["text"] }, capabilities });
  assert.equal(scoreSetFor(model({})), SCORE_SETS.image);
  assert.equal(scoreSetFor({ model_type: "video" }), null);
  assert.equal(meetsRequirement(criterion, model({ image_edits: true, max_reference_images: 1 })), false);
  assert.equal(meetsRequirement(criterion, model({ image_edits: true, max_reference_images: 4 })), true);
});
