import * as xml from "@libs/xml";
import * as path from "@std/path";
import * as fs from "@std/fs";
import { sassPlugin } from "esbuild-sass";
import { denoPlugins } from "@luca/esbuild-deno";
import { fileToString, getPath } from "./utils.ts";
import type { Config } from "./types.ts";
import { loaderPlugins } from "./skipPlugins.ts";

/**
 * Collection of utilities specific to the needs of esbuild.
 * @module
 */

/**
 * Transforms index.html found in Deno.cwd(), and returns it as a string.
 * This function will replace .ts scripts to .js, and map them post esbuild, as well as
 * add .css links.
 * @param esbuildEvent - Whether or not to add the server event to support live-reloading
 * @returns The transformed index.html as a string
 */
export const xformIndexHtml = (esbuildEvent?: boolean): string => {
  // remap script files in body to .js
  interface HTMLScript {
    "@type": string;
    "@src": string;
  }

  const indexHtml = fileToString(`${Deno.cwd()}/index.html`);
  // deno-lint-ignore no-explicit-any
  const htmlMarkup = xml.parse(indexHtml) as Record<string, any>;
  const htmlScripts: HTMLScript[] = Array.isArray(htmlMarkup.html.body.script)
    ? htmlMarkup.html.body.script
    : [htmlMarkup.html.body.script];

  const scriptsRemapped: HTMLScript[] = htmlScripts.map((scripts) => {
    const meta = path.parse(scripts["@src"]);
    meta.ext = ".js";

    return {
      "@type": "module",
      "@src": `./${meta.name}${meta.ext}`,
    };
  });

  // add esbuild server event for live reload
  if (esbuildEvent) {
    htmlMarkup.html.body.script = [
      {
        "#text":
          `new EventSource("/esbuild").addEventListener("change", function () { location.reload() });`,
      },
      ...scriptsRemapped,
    ];
  } else {
    htmlMarkup.html.body.script = [
      ...scriptsRemapped,
    ];
  }

  // add .css link to head
  htmlMarkup.html.head.link = {
    "@rel": "stylesheet",
    "@href": "./main.css",
  };

  // correct self closing tags from </> to <el></el>
  let str = xml.stringify(htmlMarkup);
  const selfClosing = str.match(/\S.+\/>/gm);
  selfClosing?.forEach((selfTag) => {
    const tag = selfTag.substring(1, selfTag.indexOf(" "));
    const fixedTag = selfTag.replace("/>", `></${tag}>`);

    str = str.replace(selfTag, fixedTag);
  });

  return str;
};

/**
 * Gets any compilerOptions found in the cwd deno.json, and applies them to the Deno defaults.
 * @returns tsconfig.compilerOptions
 */
export const getTsCompilerOptions = (): {
  compilerOptions: Record<string, string | boolean | string[]>;
} => {
  // get compilerOptions from deno.json and prep for esbuild tsconfigRaw
  const denoJson = JSON.parse(fileToString(`${Deno.cwd()}/deno.json`));
  const tsCompilerOptions = {
    compilerOptions: {
      allowJs: true,
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      checkJs: false,
      jsx: "react",
      jsxFactory: "React.createElement",
      jsxFragmentFactory: "React.Fragment",
      keyofStringsOnly: false,
      lib: [],
      noErrorTruncation: false,
      noFallthroughCasesInSwitch: false,
      noImplicitAny: true,
      noImplicitOverride: true,
      noImplicitReturns: false,
      noImplicitThis: true,
      noImplicitUseStrict: true,
      noStrictGenericChecks: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noUncheckedIndexedAccess: false,
      reactNamespace: "React",
      strict: true,
      strictBindCallApply: true,
      strictFunctionTypes: true,
      strictPropertyInitialization: true,
      strictNullChecks: true,
      suppressExcessPropertyErrors: false,
      suppressImplicitAnyIndexErrors: false,
      useUnknownInCatchVariables: true,
      ...denoJson.compilerOptions,
    },
  };

  tsCompilerOptions.compilerOptions.lib.push("deno.window");

  return tsCompilerOptions;
};

/**
 * Gets therapy config. If it is found, it will apply supplied configs to the default. esbuild plugins are also
 * applied at this stage.
 * @param configType - If the config should be passed to build or serve
 * @returns The therapy config
 */
export const getTherapyConfig = (
  configType: "serve" | "build",
): Config => {
  // default therapy config
  let therapyConfig: Config = {
    port: 4200,
    entryPoints: ["./src/**/*.ts", "./src/**/*.tsx"],
    bundle: true,
    splitting: true,
    loader: {},
    tsconfigRaw: getTsCompilerOptions(),
    plugins: [],
    sourcemap: true,
    format: "esm",
    extraTypes: [],
  };

  // if there is a therapy config, get its settings and change the defaults
  if (
    configType && fs.existsSync(getPath(`${Deno.cwd()}/therapy.config.json`))
  ) {
    try {
      const importConfig = JSON.parse(
        fileToString(`${Deno.cwd()}/therapy.config.json`),
      );

      therapyConfig = {
        ...therapyConfig,
        ...importConfig[configType],
      };
    } catch (e) {
      throw new Error(`Error reading therapy.config: ${e}`);
    }
  }

  therapyConfig.plugins = [
    sassPlugin({
      filter: /\.module\.scss$/,
      type: "local-css",
    }),
    sassPlugin({
      filter: /\.module\.sass$/,
      type: "local-css",
    }),
    sassPlugin({
      filter: /\.scss$/,
      type: "css",
    }),
    sassPlugin({
      filter: /\.sass$/,
      type: "css",
    }),
    ...loaderPlugins(therapyConfig.extraTypes),
    ...therapyConfig.plugins!,
    ...denoPlugins(),
  ];

  therapyConfig.loader = {
    ...therapyConfig.loader,
    ".ts": "ts",
  };

  return therapyConfig;
};
