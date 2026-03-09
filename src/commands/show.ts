import { Command } from "commander";
import { getMeeting } from "../core/cache.js";
import { prosemirrorToMarkdown } from "../core/prosemirror.js";
import { isDebriefed } from "../core/state.js";
import { output, getMode } from "../output/format.js";
import { exitWithError, makeError, EXIT_CODES } from "../output/errors.js";

export function registerShowCommand(program: Command) {
  program
    .command("show <id>")
    .description("Show full meeting detail")
    .option("--transcript", "Show only the transcript")
    .option("--notes", "Show only the notes")
    .action((id, opts) => {
      const meeting = getMeeting(id);
      if (!meeting) {
        exitWithError(
          EXIT_CODES.NOT_FOUND,
          makeError("NOT_FOUND", `Meeting not found: ${id}`, "Use 'granola list --all' to see all meeting IDs")
        );
      }

      const context = {
        id: meeting.id,
        title: meeting.title,
        created_at: meeting.created_at,
        attendees: meeting.attendees,
      };

      if (opts.transcript) {
        if (!meeting.transcript || meeting.transcript.length === 0) {
          output({ transcript: null, message: "No transcript available" });
          return;
        }
        if (getMode() === "human") {
          for (const u of meeting.transcript) {
            console.log(`[${u.source}] ${u.text}`);
          }
        } else {
          output({ ...context, transcript: meeting.transcript });
        }
        return;
      }

      if (opts.notes) {
        if (getMode() === "human") {
          console.log(meeting.notes_markdown || "(no notes)");
        } else {
          output({
            ...context,
            notes_markdown: meeting.notes_markdown,
            notes_plain: meeting.notes_plain,
          });
        }
        return;
      }

      // Full detail
      const result = {
        ...context,
        updated_at: meeting.updated_at,
        debriefed: isDebriefed(meeting.id),
        calendar_event: meeting.calendar_event
          ? {
              summary: meeting.calendar_event.summary,
              start: meeting.calendar_event.start.dateTime,
              end: meeting.calendar_event.end.dateTime,
            }
          : null,
        notes_markdown: meeting.notes_markdown,
        has_transcript: Boolean(
          meeting.transcript && meeting.transcript.length > 0
        ),
        transcript_length: meeting.transcript?.length || 0,
      };

      output(result);
    });
}
