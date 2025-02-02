import { Buffer } from "node:buffer";
import * as fs from "@std/fs";
import { getPath, writeFile } from "./utils.ts";
import { build } from "./esbuild-cmds.ts";
import { getTherapyConfig, xformIndexHtml } from "./esbuild-utils.ts";

/**
 * This module runs the final esbuild into an output directory.
 * @module
 */

/**
 * Builds project through esbuild. Will output to Deno.cwd()/dist
 * by default, and clean that dir if it exists.
 */
export const runBuild = async (): Promise<void> => {
  const therapyConfig = getTherapyConfig("build");

  if (!therapyConfig.outdir) {
    therapyConfig.outdir = getPath(`${Deno.cwd()}/dist`);
  }

  const outputPath = therapyConfig.outdir!;

  if (fs.existsSync(outputPath)) {
    Deno.removeSync(outputPath, { recursive: true });
  }
  Deno.mkdirSync(outputPath);

  const indexHtml = xformIndexHtml();

  therapyConfig.sourcemap = false;
  therapyConfig.minify = true;

  // write index.html to tmp folder
  writeFile(
    getPath(`${outputPath}/index.html`),
    Buffer.from(indexHtml),
  );

  await build(therapyConfig);
};

if (import.meta.main) await runBuild();
