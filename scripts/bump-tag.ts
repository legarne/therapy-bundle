import { join } from "@std/path";
import { Buffer } from "node:buffer";
import chalk from "chalk";
import { parseArgs } from "@std/cli";

const decoder = new TextDecoder();

const denoJson = JSON.parse(decoder.decode(
  Deno.readFileSync(join(Deno.cwd(), "deno.json")),
));

console.log(
  `${chalk.green("Current version is: ")}${chalk.yellow(denoJson.version)}`,
);
const newVersion = parseArgs(Deno.args)._[0].toString();
// const newVersion = prompt(`${chalk.green("Please set new version: ")}`);

const semver = /\d+\.\d+\.\d+/;
const isValid = !!newVersion?.match(semver);

if (!isValid) {
  console.log(chalk.red("Version provided is not valid semver"));
  Deno.exit(1);
}

denoJson.version = newVersion;

console.log(chalk.blue("Saving new version to deno.json"));

Deno.writeFileSync(
  join(Deno.cwd(), "deno.json"),
  Buffer.from(JSON.stringify(denoJson, null, 2)),
);

console.log(chalk.blue("Pushing new git tag"));

console.log(
  `${chalk.blue("Set version and tag to: ")}${chalk.yellow(newVersion)}`,
);
