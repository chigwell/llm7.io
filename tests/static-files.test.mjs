import test from "node:test";
import assert from "node:assert/strict";
import { replaceDirectory } from "../scripts/static-files.mjs";
test("static output replacement keeps removal before recursive copy and propagates errors", () => {
  const calls = [];
  const fs = {
    rmSync: (...args) => calls.push(["rm", ...args]),
    cpSync: (...args) => calls.push(["cp", ...args]),
  };
  replaceDirectory("source", "destination", fs);
  assert.deepEqual(calls, [
    ["rm", "destination", { recursive: true, force: true }],
    ["cp", "source", "destination", { recursive: true }],
  ]);
  assert.throws(
    () =>
      replaceDirectory("missing", "destination", {
        ...fs,
        cpSync: () => {
          throw new Error("missing");
        },
      }),
    /missing/,
  );
});
