# Granola CLI

CLI for Granola meeting notes. Reads directly from Granola's local cache file. Designed for LLM consumption — all output is JSON by default.

## Quick Reference

```bash
# List meetings
granola list                          # Last 72 hours (default)
granola list --since 2026-03-01       # Since specific date
granola list --all                    # All meetings
granola list --pending                # Only meetings not yet debriefed

# Show meeting detail
granola show <id>                     # Full detail (attendees, notes, calendar)
granola show <id> --notes             # Just the notes
granola show <id> --transcript        # Just the transcript (if available)

# Debrief tracking
granola status                        # Debrief status for last 7 days
granola status --all                  # All meetings
granola debrief <id>                  # Mark as debriefed
granola debrief <id> --undo           # Unmark
```

## Preferred Workflow

1. `granola list` — see recent meetings
2. `granola show <id>` — read notes/transcript
3. Discuss action items, create Things todos: `things add "..." --due +3d --tags Work`
4. `granola debrief <id>` — mark as done

Use `granola list --pending` to find meetings that still need review.

## Output Modes

- `--json` — JSON (default, for LLM consumption)
- `--pretty` — Pretty-printed JSON
- `--human` — Human-readable terminal output
- `--quiet` — No output, exit code only

## Data Source

Reads `~/Library/Application Support/Granola/cache-v4.json` (falls back to v3). No API calls, no auth needed. Data is as fresh as the last time Granola synced.

## State

Debrief state stored at `~/.granola-cli/state.json`. Tracks which meetings have been debriefed and when.

## Development

```bash
bun run src/index.ts list --all       # Run directly
bun run build                         # Compile to ./granola binary
cp granola ~/.local/bin/granola       # Install
```

Architecture: Commands in `src/commands/`, core logic in `src/core/` (cache.ts reads Granola cache, prosemirror.ts converts ProseMirror to markdown, state.ts manages debrief tracking), output formatting in `src/output/`.
