import { assert, assertEquals } from "jsr:@std/assert";
import { fileToString, getPath, initTherapy } from "../utils.ts";
import { join } from "@std/path";
import { existsSync } from "@std/fs";
import files from "../files.ts";

const mocksDir = join(`${import.meta.dirname}`, "_mocks");
const tmpDir = join(`${mocksDir}`, "tmp");

const clearTmp = () => {
  const tmpPath = join(`${mocksDir}`, "tmp");
  if (existsSync(tmpPath)) Deno.removeSync(tmpPath, { recursive: true });
};

Deno.test("mod:init", () => {
  clearTmp();

  initTherapy(tmpDir);

  Object.entries(files).forEach(([filePath, fileData]) => {
    const mockPath = getPath(`${tmpDir}/${filePath}`);
    const mockData = fileToString(mockPath);

    assert(existsSync(mockPath));
    assertEquals(mockData, fileData);
  });

  clearTmp();
});
