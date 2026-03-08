#!/usr/bin/env bun
import { createProgram } from "./cli.js";
import { setOutputMode, getOutputMode } from "./output/format.js";
import { makeError, EXIT_CODES } from "./output/errors.js";

function handleError(err: unknown): never {
  if (err instanceof Error) {
    if (err.message.includes("cache not found")) {
      console.log(
        JSON.stringify(
          makeError(
            "CACHE_ERROR",
            err.message,
            "Make sure Granola is installed and has been opened at least once"
          )
        )
      );
      process.exit(EXIT_CODES.CACHE_ERROR);
    }

    if (err.message.includes("Invalid date")) {
      console.log(
        JSON.stringify(
          makeError("INVALID_INPUT", err.message, "Use YYYY-MM-DD format")
        )
      );
      process.exit(EXIT_CODES.INVALID_INPUT);
    }

    console.log(JSON.stringify(makeError("INVALID_INPUT", err.message)));
    process.exit(EXIT_CODES.INVALID_INPUT);
  }

  console.log(JSON.stringify(makeError("UNKNOWN", String(err))));
  process.exit(EXIT_CODES.CACHE_ERROR);
}

const program = createProgram();

program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.opts();
  setOutputMode(
    getOutputMode({
      json: opts.json,
      pretty: opts.pretty,
      human: opts.human,
      quiet: opts.quiet,
    })
  );
});

try {
  await program.parseAsync(process.argv);
} catch (err) {
  handleError(err);
}
