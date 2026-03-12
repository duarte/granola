import { Command } from "commander";
import { registerListCommand } from "./commands/list.js";
import { registerShowCommand } from "./commands/show.js";
import { registerHelpCommand } from "./commands/help.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("granola")
    .description("CLI for Granola meeting notes — designed for LLM consumption")
    .version("1.2.0", "-v, --version")
    .option("--json", "JSON output (default)")
    .option("--pretty", "Pretty-printed JSON")
    .option("--human", "Human-readable output")
    .option("--quiet", "Suppress output, exit code only");

  registerListCommand(program);
  registerShowCommand(program);
  registerHelpCommand(program);

  program.action(() => {
    program.help();
  });

  return program;
}
