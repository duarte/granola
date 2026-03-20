# Granola CLI

CLI for Granola meeting notes. Reads directly from Granola's local cache file. Designed for LLM consumption — all output is JSON by default.

## Quick Reference

```bash
# List meetings
granola list                          # Last 72 hours (default)
granola list --since 2026-03-01       # Since specific date
granola list --all                    # All meetings

# Show meeting detail
granola show <id>                     # Full detail (attendees, notes, calendar)
granola show <id> --notes             # Just the notes
granola show <id> --transcript        # Just the transcript (if available)
```

## Preferred Workflow

1. `granola list` — see recent meetings
2. `granola show <id>` — read notes/transcript
3. Discuss action items, create Things todos: `things add "..." --due +3d --tags Work`

## Output Modes

- `--json` — JSON (default, for LLM consumption)
- `--pretty` — Pretty-printed JSON
- `--human` — Human-readable terminal output
- `--quiet` — No output, exit code only

## Data Source

Auto-detects the highest cache version at `~/Library/Application Support/Granola/cache-vN.json` (currently v6). No API calls, no auth needed. Data is as fresh as the last time Granola synced.

## Development

```bash
bun run src/index.ts list --all       # Run directly
bun run build                         # Compile to ./granola binary
cp granola ~/.local/bin/granola       # Install
```

Architecture: Commands in `src/commands/`, core logic in `src/core/` (cache.ts reads Granola cache, prosemirror.ts converts ProseMirror to markdown), output formatting in `src/output/`.

When making updates, bump the version number in `src/cli.ts` (the `.version()` call) and in the help text in `src/commands/help.ts`.
