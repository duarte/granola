import { Command } from "commander";
import { registerListCommand } from "./commands/list.js";
import { registerShowCommand } from "./commands/show.js";
import { registerStatusCommand } from "./commands/status.js";
import { registerDebriefCommand } from "./commands/debrief.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("granola")
    .description("CLI for Granola meeting notes — designed for LLM consumption")
    .version("1.0.0", "-v, --version")
    .option("--json", "JSON output (default)")
    .option("--pretty", "Pretty-printed JSON")
    .option("--human", "Human-readable output")
    .option("--quiet", "Suppress output, exit code only");

  registerListCommand(program);
  registerShowCommand(program);
  registerStatusCommand(program);
  registerDebriefCommand(program);

  program.action(() => {
    program.help();
  });

  return program;
}
