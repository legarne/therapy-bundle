import { join, parse } from "@std/path";
import { existsSync } from "@std/fs";
import { Buffer } from "node:buffer";
import files from "./files.ts";

/**
 * Collection of utilities for other modules to use, mainly fs operations.
 * @module
 */

/**
 * Takes a *nix path, and ensures it is properly joined and normalized.
 * @param filePath - *nix path
 * @returns A joined and normalized path
 */
export const getPath = (filePath: string): string => {
  const startSplit = filePath[0] === "/" ? "/" : "";
  const fileSplit = filePath.split("/");

  return join(...[startSplit, ...fileSplit]);
};

/**
 * Reads a file from disk.
 * @param filePath - Path to the file
 * @returns The file as a text decoded string
 */
export const fileToString = (filePath: string): string => {
  const buf = Deno.readFileSync(getPath(filePath));

  return new TextDecoder().decode(buf);
};

/**
 * Creates directories if they don't exist, recursively.
 * @param path - The target path, as a *nix path.
 */
export const makeDirIfNull = (path: string): void => {
  const pathDir = getPath(path);
  const { dir } = parse(pathDir);
  if (!existsSync(dir)) Deno.mkdirSync(dir, { recursive: true });
};

/**
 * Copies a file from to. Will recursively create directories if they don't exist.
 * @param from - The source path, as a *nix path.
 * @param to   - The target path, as a *nix path.
 */

export const copyFile = (from: string, to: string): void => {
  makeDirIfNull(to);

  Deno.copyFileSync(getPath(from), getPath(to));
};

/**
 * Writes a file to disk. Will recursively create directories if they don't exist.
 * @param dest - The destination path, as a *nix path.
 * @param data - The file data to write
 *
 * @example
 * ```ts
 * writeFile('tmp/files/test.txt', "hello world");
 * ```
 */

export const writeFile = (
  dest: string,
  data: Buffer | Uint8Array | string,
): void => {
  makeDirIfNull(dest);

  Deno.writeFileSync(getPath(dest), Buffer.from(data));
};

/**
 * Initializes a new project.
 * @param basePath - The directory to create the project files; `Deno.cwd()` by default
 */
export const initTherapy = (basePath: string = Deno.cwd()): void => {
  Object.entries(files).map(([filePath, fileData]) => {
    writeFile(`${basePath}/${filePath}`, fileData);
  });
};
