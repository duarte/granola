import { Command } from "commander";
import { getMeetings } from "../core/cache.js";
import { readState, isDebriefed } from "../core/state.js";
import { output, getMode } from "../output/format.js";

export function registerStatusCommand(program: Command) {
  program
    .command("status")
    .description("Show debrief status for recent meetings")
    .option("--all", "Include all meetings, not just recent")
    .action((opts) => {
      const meetings = getMeetings();
      const state = readState();

      const now = Date.now();
      const cutoff = now - 7 * 24 * 60 * 60 * 1000; // 7 days

      let filtered = meetings;
      if (!opts.all) {
        filtered = filtered.filter(
          (m) => new Date(m.created_at).getTime() >= cutoff
        );
      }

      const result = filtered.map((m) => {
        const debriefed = isDebriefed(m.id);
        return {
          id: m.id,
          title: m.title,
          created_at: m.created_at,
          debriefed,
          debriefed_at: debriefed
            ? state.debriefed[m.id].at
            : null,
        };
      });

      if (getMode() === "human") {
        const pending = result.filter((r) => !r.debriefed);
        const done = result.filter((r) => r.debriefed);

        if (pending.length > 0) {
          console.log("Pending debrief:");
          for (const m of pending) {
            const date = new Date(m.created_at).toLocaleDateString();
            console.log(`  ${m.title} (${date}) — ${m.id}`);
          }
        }

        if (done.length > 0) {
          console.log("\nDebriefed:");
          for (const m of done) {
            const date = new Date(m.created_at).toLocaleDateString();
            console.log(`  ${m.title} (${date})`);
          }
        }

        if (result.length === 0) {
          console.log("No meetings found in the last 7 days.");
        }
      } else {
        output(result);
      }
    });
}
