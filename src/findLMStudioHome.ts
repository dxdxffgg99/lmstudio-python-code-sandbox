import { existsSync, readFileSync, realpathSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join, resolve, isAbsolute } from "path";

let lmstudioHome: string | null = null;

export function findLMStudioHome(): string {
  if (lmstudioHome !== null) return lmstudioHome;

  const resolvedHomeDir = realpathSync(homedir());

  const pointerFilePath = join(resolvedHomeDir, ".lmstudio-home-pointer");

  try {
    if (existsSync(pointerFilePath)) {
      const raw = readFileSync(pointerFilePath, "utf-8").trim();
      if (raw) {
        lmstudioHome = isAbsolute(raw) ? raw : resolve(resolvedHomeDir, raw);
        return lmstudioHome;
      }
    }
  } catch (e) {
    // If reading the pointer file fails, continue to probe other locations.
  }

  const cacheHome = join(resolvedHomeDir, ".cache", "lm-studio");
  if (existsSync(cacheHome)) {
    lmstudioHome = cacheHome;
    try {
      writeFileSync(pointerFilePath, lmstudioHome, "utf-8");
    } catch (e) {
      // best-effort: ignore write failures
    }
    return lmstudioHome;
  }

  const home = join(resolvedHomeDir, ".lmstudio");
  lmstudioHome = home;
  try {
    writeFileSync(pointerFilePath, lmstudioHome, "utf-8");
  } catch (e) {
    // ignore
  }
  return lmstudioHome;
}
