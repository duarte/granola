import { Command } from "commander";

const HELP_TEXT = `granola — CLI for Granola meeting notes

Output is JSON by default. Designed for LLM consumption.

GLOBAL FLAGS
  --json              JSON output (default)
  --pretty            Pretty-printed JSON
  --human             Human-readable output
  --quiet             Suppress output, exit code only
  --version, -v       Version

COMMANDS
  granola list                 List meetings (default: last 72 hours)
    --since <date>             Show meetings since date (YYYY-MM-DD)
    --all                      Show all meetings

  granola show <id>            Show full meeting detail
    --notes                    Show only the notes (markdown)
    --transcript               Show only the transcript

  granola help                 Show this help

DATA SOURCE
  Reads ~/Library/Application Support/Granola/cache-vN.json (highest version found).
  No API calls, no auth needed. Data is as fresh as the last Granola sync.

OUTPUT FORMAT
  Success: JSON object (single item) or JSON array (lists)
  Error:   {"error":true,"code":"NOT_FOUND","message":"...","suggestion":"..."}

EXIT CODES
  0  Success
  1  Item not found
  2  Cache read error
  3  Invalid input

WORKFLOW EXAMPLES

  1. See recent meetings:
     granola list

  2. See all meetings since a date:
     granola list --since 2026-03-01

  3. Read meeting notes:
     granola show <id> --notes

  4. Read transcript:
     granola show <id> --transcript

  5. Full meeting detail (attendees, calendar, notes):
     granola show <id>

  6. Human-readable output:
     granola list --human`;

export function registerHelpCommand(program: Command) {
  program
    .command("help")
    .description("Show detailed help")
    .action(() => {
      console.log(HELP_TEXT);
    });
}
