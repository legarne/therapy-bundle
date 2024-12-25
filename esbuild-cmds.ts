import * as esbuild from "esbuild";
import chalk from "chalk";
import type { Config } from "./types.ts";

/**
 * The primary commands for building and serving.
 * @module
 */

/**
 * Runs esbuild's serve and watch capabilities.
 * @param therapyConfig - A passed config, where the port and esbuild options are consumed
 */
export const serve = async (therapyConfig: Config): Promise<void> => {
  const { port, extraTypes: _extraTypes, ...esbuildConfig } = therapyConfig;

  const ctx = await esbuild.context({
    logLevel: "warning",
    ...esbuildConfig,
  });

  await ctx.watch();

  await ctx.serve({
    port,
    servedir: therapyConfig.outdir,
  });

  console.log(`
  ${chalk.blue(`Serving from:`)}
    ${chalk.blue("Port: ")}${chalk.yellow(port)}
    ${chalk.blue("Tmp Dir: ")}${chalk.yellow(therapyConfig.outdir)}`);
};

/**
 * Runs esbuild's build capability.
 * @param therapyConfig - A passed config, where the esbuild options are consumed
 */
export const build = async (therapyConfig: Config): Promise<void> => {
  const { port: _port, extraTypes: _extraTypes, ...esbuildConfig } =
    therapyConfig;

  await esbuild.build({
    logLevel: "info",
    ...esbuildConfig,
  });

  await esbuild.stop();

  console.log(
    `${chalk.blue("Built into: ")}${chalk.yellow(esbuildConfig.outdir)}`,
  );
};
