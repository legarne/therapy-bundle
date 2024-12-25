import * as path from "@std/path";
import type { Loader, Plugin } from "esbuild";

const loaderTypes: Record<string, Loader> = {
  "css": "css",
  "module.css": "local-css",
  "json": "json",
  "txt": "text",
  "data": "binary",
  "png": "dataurl",
  "svg": "dataurl",
};

// https://github.com/lucacasonato/esbuild_deno_loader/issues/134#issuecomment-2297004213

/**
 * Creates esbuild plugins for each default type loader, and any extra loaders from the config file.
 * These plugins are applied first, before deno resolution
 *
 * @param extraTypes - Extra type and loaders
 */
export const loaderPlugins = (
  extraTypes?: [string, Loader][],
): Plugin[] => {
  const extraLoaders: [string, Loader][] =
    extraTypes?.map(([fileType, loader]) => [fileType, loader]) ?? [];

  return Object.entries(loaderTypes).concat(extraLoaders).map(
    ([fileExt, loader]) => {
      return {
        name: `therapy-${fileExt}-loader`,
        setup: (build) => {
          const fileRegex = new RegExp(`\.${fileExt}$`);
          build.onResolve({ filter: fileRegex, namespace: "file" }, (args) => {
            return {
              path: path.resolve(args.resolveDir, args.path),
            };
          });
          build.onLoad({ filter: fileRegex, namespace: "file" }, (args) => {
            const contents = Deno.readFileSync(args.path);
            // catch for css modules
            if (args.path.includes(".module.css")) {
              return {
                contents,
                loader: "local-css",
              };
            }
            return {
              contents,
              loader,
            };
          });
          build.onResolve({ filter: /.*/, namespace: "data" }, (args) => {
            return args.kind !== "url-token" ? undefined : { external: true };
          });
        },
      };
    },
  );
};
