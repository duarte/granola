export type OutputMode = "json" | "pretty" | "human" | "quiet";

let globalMode: OutputMode = "json";

export function setOutputMode(mode: OutputMode) {
  globalMode = mode;
}

export function getMode(): OutputMode {
  return globalMode;
}

export function output(data: unknown): void {
  switch (globalMode) {
    case "json":
      console.log(JSON.stringify(data));
      break;
    case "pretty":
      console.log(JSON.stringify(data, null, 2));
      break;
    case "human":
      if (Array.isArray(data)) {
        for (const item of data) {
          printHuman(item);
        }
      } else {
        printHuman(data);
      }
      break;
    case "quiet":
      break;
  }
}

function printHuman(item: unknown): void {
  if (typeof item !== "object" || item === null) {
    console.log(String(item));
    return;
  }
  const obj = item as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object") {
      console.log(`${key}: ${JSON.stringify(value)}`);
    } else {
      console.log(`${key}: ${value}`);
    }
  }
  console.log();
}

export function getOutputMode(opts: {
  json?: boolean;
  pretty?: boolean;
  human?: boolean;
  quiet?: boolean;
}): OutputMode {
  if (opts.quiet) return "quiet";
  if (opts.human) return "human";
  if (opts.pretty) return "pretty";
  return "json";
}
