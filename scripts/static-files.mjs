import { rmSync, cpSync } from "node:fs";

export function replaceDirectory(
  source,
  destination,
  filesystem = { rmSync, cpSync },
) {
  filesystem.rmSync(destination, { recursive: true, force: true });
  filesystem.cpSync(source, destination, { recursive: true });
}
