import { $ } from "bun";

await $`bun build --compile src/index.ts --outfile granola`;
console.log("Built: ./granola");
