import test from "node:test";
import assert from "node:assert/strict";

import {
  getWorkflowChecklist,
  renderWorkflowItems
} from "../script.js";

test("getWorkflowChecklist returns three learning targets", () => {
  const items = getWorkflowChecklist();

  assert.equal(items.length, 4);
  assert.deepEqual(
    items.map((item) => item.id),
    ["test", "review", "deploy"]
  );
});

test("renderWorkflowItems renders each title and badge", () => {
  const html = renderWorkflowItems(getWorkflowChecklist());

  assert.match(html, /自動テスト/);
  assert.match(html, /AI PRレビュー/);
  assert.match(html, /GitHub Pagesデプロイ/);
  assert.match(html, />1</);
  assert.match(html, />3</);
});
