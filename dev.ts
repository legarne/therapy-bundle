import chalk from "chalk";
import { Buffer } from "node:buffer";
import * as os from "node:os";
import { getPath } from "./utils.ts";
import { serve } from "./esbuild-cmds.ts";
import { getTherapyConfig, xformIndexHtml } from "./esbuild-utils.ts";

/**
 * This module is responsible for running the esbuild development and watch server.
 * @module
 */

/**
 * Runs the development server. Will create a temporary directory if `outdir` is not supplied.
 * This temp directory will be __cleared__ after each run of the server. This function attempts to find
 * an index.html at Deno.cwd() to copy over.
 */
export const runServe = async (): Promise<void> => {
  // Prep tmp dir for storage
  const tmpDirs = Deno.readDirSync(os.tmpdir());
  let maybeTmp: Deno.DirEntry | null = null;

  for (const dir of tmpDirs) {
    if (dir.name.includes("therapym_")) {
      maybeTmp = dir;
      break;
    }
  }

  console.log(chalk.blue("Getting temp folder"));

  const therapyConfig = getTherapyConfig("serve");

  // always reuse a tmp dir if it exists
  if (!therapyConfig.outdir) {
    therapyConfig.outdir = maybeTmp
      ? getPath(`${os.tmpdir()}/${maybeTmp.name}`)
      : Deno.makeTempDirSync({ prefix: "therapym_" });
  }

  const tmpPath = therapyConfig.outdir!;

  Deno.removeSync(tmpPath, { recursive: true });
  Deno.mkdirSync(tmpPath);

  const indexHtml = xformIndexHtml(true);

  // write index.html to tmp folder
  Deno.writeFileSync(
    getPath(`${tmpPath}/index.html`),
    Buffer.from(indexHtml),
  );

  console.log(chalk.blue("Reading deno.json"));

  await serve(therapyConfig);
};

if (import.meta.main) await runServe();
