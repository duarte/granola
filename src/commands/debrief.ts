import { Command } from "commander";
import { getMeeting } from "../core/cache.js";
import { markDebriefed, unmarkDebriefed, isDebriefed } from "../core/state.js";
import { output } from "../output/format.js";
import { exitWithError, makeError, EXIT_CODES } from "../output/errors.js";

export function registerDebriefCommand(program: Command) {
  program
    .command("debrief <id>")
    .description("Mark a meeting as debriefed")
    .option("--undo", "Unmark meeting as debriefed")
    .action((id, opts) => {
      const meeting = getMeeting(id);
      if (!meeting) {
        exitWithError(
          EXIT_CODES.NOT_FOUND,
          makeError("NOT_FOUND", `Meeting not found: ${id}`, "Use 'granola list --all' to see all meeting IDs")
        );
      }

      if (opts.undo) {
        unmarkDebriefed(id);
        output({
          id,
          title: meeting.title,
          debriefed: false,
          message: "Meeting unmarked as debriefed",
        });
      } else {
        markDebriefed(id);
        output({
          id,
          title: meeting.title,
          debriefed: true,
          message: "Meeting marked as debriefed",
        });
      }
    });
}
