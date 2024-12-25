import type { BuildOptions, Loader } from "esbuild";

/**
 * This module contains the type of a therapy config file
 * @module
 */

/**
 * The configuration interface for a therapy.config.ts file.
 * This type should be applied to an exported `serveConfig` and/or `buildConfig` constant.
 * It also accepts options provided by `esbuild`.
 */
export interface Config extends Partial<BuildOptions> {
  /** The port to run the development server on; 4200 by default. */
  port?: number;

  /** Additional file types and their related loader(s).
   * @example
   * ```ts
   * export const buildConfig: Config = {
   *   extraTypes: [
   *     ["bin", "binary"],
   *     ["csv", "text"],
   *   ],
   * }
   * ```
   */
  extraTypes?: [string, Loader][];
}
