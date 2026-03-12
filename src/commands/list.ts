import { Command } from "commander";
import { getMeetings } from "../core/cache.js";
import { output } from "../output/format.js";

export function registerListCommand(program: Command) {
  program
    .command("list")
    .description("List meetings (default: last 72 hours)")
    .option("--since <date>", "Show meetings since date (YYYY-MM-DD)")
    .option("--all", "Show all meetings")
    .action((opts) => {
      const meetings = getMeetings();
      const now = Date.now();
      const defaultCutoff = now - 72 * 60 * 60 * 1000;

      // Use calendar event start time if available, otherwise fall back to created_at
      const meetingTime = (m: (typeof meetings)[0]): number =>
        m.calendar_event?.start?.dateTime
          ? new Date(m.calendar_event.start.dateTime).getTime()
          : new Date(m.created_at).getTime();

      let filtered = meetings;

      if (!opts.all) {
        let cutoff: number;
        if (opts.since) {
          cutoff = new Date(opts.since).getTime();
          if (isNaN(cutoff)) {
            throw new Error(`Invalid date: ${opts.since}. Use YYYY-MM-DD format.`);
          }
        } else {
          cutoff = defaultCutoff;
        }
        filtered = filtered.filter((m) => meetingTime(m) >= cutoff);
      }

      // Sort by meeting time, newest first
      filtered.sort((a, b) => meetingTime(b) - meetingTime(a));

      const result = filtered.map((m) => ({
        id: m.id,
        title: m.title,
        time: m.calendar_event?.start?.dateTime || m.created_at,
        attendees: m.attendees.map((a) => a.name),
        has_notes: m.notes_markdown.length > 0,
        has_calendar_event: Boolean(m.calendar_event),
        needs_notes: Boolean(m.calendar_event) && m.notes_markdown.length === 0,
      }));

      output(result);
    });
}
