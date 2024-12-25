import { assert, assertEquals, assertFalse } from "jsr:@std/assert";
import { join } from "@std/path";
import { existsSync } from "@std/fs";
import {
  copyFile,
  fileToString,
  getPath,
  makeDirIfNull,
  writeFile,
} from "../utils.ts";

const mocksDir = join(`${import.meta.dirname}`, "_mocks");
const clearTmp = () => {
  const tmpPath = join(`${mocksDir}`, "tmp");
  if (existsSync(tmpPath)) Deno.removeSync(tmpPath, { recursive: true });
};

Deno.test("utils:getPath", () => {
  const testRootPath = getPath("/test/path/example.txt");
  const joinRootPath = join("/", "test", "path", "example.txt");

  const testPath = getPath("test/path/example.txt");
  const joinPath = join("test", "path", "example.txt");

  assertEquals(testRootPath, joinRootPath);
  assertEquals(testPath, joinPath);
});

Deno.test({
  name: "utils:fileToString",
  permissions: { read: true },
  fn: () => {
    const mockStr = "test file";
    const fileData = fileToString(`${mocksDir}/testFile.txt`);

    assertEquals(fileData, mockStr);
  },
});

Deno.test({
  name: "utils:makeDirIfNull",
  permissions: { read: true, write: true },
  fn: () => {
    clearTmp();
    assertFalse(existsSync(getPath(`${mocksDir}/tmp/dir/test`)));

    makeDirIfNull(`${mocksDir}/tmp/dir/test/f.txt`);

    assert(existsSync(getPath(`${mocksDir}/tmp/dir/test`)));
  },
});

Deno.test({
  name: "utils:copyFile",
  permissions: { read: true, write: true },
  fn: () => {
    clearTmp();
    assertFalse(existsSync(getPath(`${mocksDir}/tmp/dir/test/testFile.txt`)));

    copyFile(
      `${mocksDir}/testFile.txt`,
      `${mocksDir}/tmp/dir/test/testFile.txt`,
    );

    assert(existsSync(getPath(`${mocksDir}/tmp/dir/test/testFile.txt`)));

    const fileContents = fileToString(`${mocksDir}/testFile.txt`);
    const mockContents = fileToString(`${mocksDir}/tmp/dir/test/testFile.txt`);

    assertEquals(fileContents, mockContents);
  },
});

Deno.test({
  name: "utils:writeFile",
  permissions: { write: true, read: true },
  fn: () => {
    clearTmp();

    writeFile(`${mocksDir}/tmp/writeFile.txt`, "hello world");
    const file = fileToString(`${mocksDir}/tmp/writeFile.txt`);

    assertEquals(file, "hello world");
  },
});
